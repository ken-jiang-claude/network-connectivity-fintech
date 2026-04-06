import subprocess
import platform


SCENARIOS = {
    "fix_session_drop": {
        "title": "FIX Session Disconnects Unexpectedly",
        "symptoms": ["Heartbeat timeout", "TCP connection reset", "MsgSeqNum gap"],
        "causes": [
            "Network device (firewall/NAT) silently drops idle TCP connections",
            "Heartbeat interval (Tag 108) too long for network timeout",
            "WAN link instability causing packet loss"
        ],
        "steps": [
            "Check if HeartBtInt (Tag 108) < network idle timeout (often 30s for firewalls)",
            "Run 'netstat -an' to confirm TCP socket state (ESTABLISHED vs CLOSE_WAIT)",
            "Ping the counterparty to test basic IP reachability",
            "Use traceroute/tracert to identify where packets are dropped",
            "Review FIX engine logs for last received MsgSeqNum before disconnect",
            "Enable TCP keepalive on the socket (SO_KEEPALIVE) as a fallback"
        ],
        "network_layer": "Layer 4 (Transport) + Layer 5 (Session)",
        "fix_tags": {"35": "MsgType", "108": "HeartBtInt", "34": "MsgSeqNum"}
    },
    "high_latency": {
        "title": "High Latency on Order Submission",
        "symptoms": ["Orders take >50ms to fill", "Timestamps show delay between Tag 52 and execution"],
        "causes": [
            "Network congestion on WAN link",
            "TCP retransmission due to packet loss",
            "DNS resolution delay on initial connection",
            "SSL/TLS handshake overhead"
        ],
        "steps": [
            "Compare SendingTime (Tag 52) with TransactTime (Tag 60) in execution reports",
            "Run ping with multiple packets: 'ping -n 100 <exchange-ip>' to measure jitter",
            "Use traceroute to find the high-latency hop",
            "Check NIC and network driver settings (TCP offload, interrupt coalescing)",
            "Consider dedicated leased line or co-location if WAN latency is the bottleneck",
            "Pre-resolve DNS and cache IPs to avoid lookup delays"
        ],
        "network_layer": "Layer 3 (Network) + Layer 4 (Transport)",
        "fix_tags": {"52": "SendingTime", "60": "TransactTime"}
    },
    "sequence_gap": {
        "title": "FIX Sequence Number Gap / ResendRequest Loop",
        "symptoms": ["ResendRequest (35=2) sent repeatedly", "Session stuck, no new orders processed"],
        "causes": [
            "Messages lost due to TCP buffer overflow or app crash",
            "Clocks out of sync causing sequence confusion",
            "Counterparty reset sequence numbers without Logout"
        ],
        "steps": [
            "Check FIX logs for last sent/received MsgSeqNum (Tag 34)",
            "Send ResendRequest (35=2) with BeginSeqNo and EndSeqNo",
            "If gap unresolvable, negotiate sequence reset: SequenceReset (35=4) with GapFillFlag (Tag 123=Y)",
            "Verify system clocks are NTP-synchronized on both sides",
            "Restart session with agreed reset: Logon with ResetSeqNumFlag (Tag 141=Y)"
        ],
        "network_layer": "Layer 5 (Session) — FIX application layer",
        "fix_tags": {"34": "MsgSeqNum", "35": "MsgType (2=ResendRequest, 4=SequenceReset)", "123": "GapFillFlag", "141": "ResetSeqNumFlag"}
    },
    "no_connectivity": {
        "title": "Cannot Establish FIX Connection",
        "symptoms": ["TCP connection refused", "Connection timeout", "Logon message never sent"],
        "causes": [
            "Wrong IP address or port configured",
            "Firewall blocking the TCP port",
            "SSL certificate mismatch",
            "Exchange/counterparty system down"
        ],
        "steps": [
            "Verify IP and port in FIX session config (SocketConnectHost, SocketConnectPort)",
            "Test TCP reachability: 'telnet <ip> <port>' or 'Test-NetConnection <ip> -Port <port>'",
            "Check firewall rules: ensure outbound TCP to exchange port is allowed",
            "Confirm SSL certificate is valid and trusted if using encrypted FIX",
            "Contact counterparty to confirm their session is active",
            "Verify no IP whitelist restriction at the exchange end"
        ],
        "network_layer": "Layer 3 (Network) + Layer 4 (Transport)",
        "fix_tags": {}
    },
    "market_data_missing": {
        "title": "Market Data Feed Not Receiving Updates",
        "symptoms": ["Stale prices", "Missing quote updates", "UDP multicast not arriving"],
        "causes": [
            "Multicast group not joined on the NIC",
            "Switch not forwarding multicast (IGMP snooping misconfigured)",
            "UDP packet loss on WAN (no retransmission unlike TCP)",
            "Firewall blocking UDP multicast"
        ],
        "steps": [
            "Confirm multicast group membership: 'netsh interface ip show joins' (Windows)",
            "Check switch IGMP snooping configuration",
            "Use Wireshark to capture UDP packets on the multicast group",
            "If using TCP-based feed (e.g., FIX 35=W), check TCP session health",
            "Review feed handler logs for gap indicators",
            "Request snapshot/refresh (35=V MarketDataRequest) to resync"
        ],
        "network_layer": "Layer 2 (Data Link) + Layer 3 (Network) — multicast",
        "fix_tags": {"35": "MsgType (V=MarketDataRequest, W=MarketDataSnapshot)"}
    }
}

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "A FIX session keeps disconnecting every 30 minutes. The HeartBtInt is set to 60 seconds. What is the most likely cause?",
        "options": [
            "The FIX engine has a bug",
            "A firewall is dropping idle TCP connections before the heartbeat fires",
            "The exchange is rejecting the Logon message",
            "The sequence numbers are out of sync"
        ],
        "answer": 1,
        "explanation": "Many firewalls have idle connection timeouts (often 30–60 minutes). If the heartbeat interval is too long, the firewall may drop the TCP connection silently. Solution: reduce HeartBtInt or enable TCP keepalive."
    },
    {
        "id": 2,
        "question": "What OSI layer does FIX session management (Logon, Heartbeat, Logout) operate at?",
        "options": ["Layer 3 – Network", "Layer 4 – Transport", "Layer 5 – Session", "Layer 7 – Application"],
        "answer": 2,
        "explanation": "FIX session management (connection establishment, keepalive, teardown) maps to Layer 5 (Session). The actual business messages (orders, executions) are Layer 7 (Application). FIX runs over TCP which is Layer 4."
    },
    {
        "id": 3,
        "question": "Why does market data typically use UDP instead of TCP in low-latency trading?",
        "options": [
            "UDP is more reliable than TCP",
            "UDP avoids TCP retransmission delays — a stale retransmit is worse than a missing packet",
            "Exchanges only support UDP",
            "TCP cannot handle multicast"
        ],
        "answer": 1,
        "explanation": "In fast markets, a TCP retransmit delivering an old price is worse than just missing it. UDP multicast also allows one sender to reach thousands of subscribers simultaneously, far more efficient than individual TCP connections."
    },
    {
        "id": 4,
        "question": "A broker connects to an exchange via a transatlantic WAN link (NY to London). Round-trip latency is 85ms. What is the maximum theoretical order round-trips per second?",
        "options": ["~12 round trips/sec", "~100 round trips/sec", "~1000 round trips/sec", "Latency does not affect throughput"],
        "answer": 0,
        "explanation": "With 85ms RTT, you can do at most ~11.7 sequential round trips per second (1000ms / 85ms). This is why co-location and pipelining (sending multiple orders without waiting for acks) are critical in electronic trading."
    },
    {
        "id": 5,
        "question": "During a FIX session, you receive a ResendRequest (35=2) from the counterparty. What does this mean?",
        "options": [
            "The counterparty wants to reset the session",
            "The counterparty detected a gap in your sequence numbers and wants missing messages re-sent",
            "The counterparty is rejecting your last order",
            "The TCP connection is about to be closed"
        ],
        "answer": 1,
        "explanation": "A ResendRequest (35=2) means the receiver detected a gap — e.g., it received MsgSeqNum 10 after 7, so it requests 8 and 9. This is FIX's application-level reliability mechanism, analogous to TCP's SACK (selective acknowledgement)."
    }
]


def diagnose_network_issue(issue_description):
    """Diagnose common fintech network issues based on description keywords."""
    desc = issue_description.lower()

    if any(k in desc for k in ["disconnect", "drop", "heartbeat", "timeout"]):
        s = SCENARIOS["fix_session_drop"]
    elif any(k in desc for k in ["slow", "latency", "delay", "lag"]):
        s = SCENARIOS["high_latency"]
    elif any(k in desc for k in ["sequence", "gap", "resend", "seqnum"]):
        s = SCENARIOS["sequence_gap"]
    elif any(k in desc for k in ["cannot connect", "refused", "no connection", "logon"]):
        s = SCENARIOS["no_connectivity"]
    elif any(k in desc for k in ["market data", "quote", "feed", "multicast", "udp"]):
        s = SCENARIOS["market_data_missing"]
    else:
        return {
            "title": "General Network Issue",
            "steps": [
                "Verify basic IP connectivity with ping",
                "Check TCP port reachability with telnet or Test-NetConnection",
                "Review FIX engine logs for error messages",
                "Confirm firewall rules allow the FIX session port",
                "Check system and network logs for errors around the time of the issue"
            ],
            "network_layer": "Unknown — gather more details",
            "fix_tags": {}
        }

    return s


def check_ping(host):
    """Ping a host and return result dict with latency info."""
    param = "-n" if platform.system().lower() == "windows" else "-c"
    count = "4"
    try:
        result = subprocess.run(
            ["ping", param, count, host],
            capture_output=True, text=True, timeout=10
        )
        output = result.stdout + result.stderr
        reachable = result.returncode == 0
        return {"reachable": reachable, "output": output, "host": host}
    except subprocess.TimeoutExpired:
        return {"reachable": False, "output": "Ping timed out.", "host": host}
    except Exception as e:
        return {"reachable": False, "output": str(e), "host": host}


def get_all_scenarios():
    return SCENARIOS


def get_quiz():
    return QUIZ_QUESTIONS
