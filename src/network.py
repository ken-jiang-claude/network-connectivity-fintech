class NetworkConcepts:
    def __init__(self):
        self.concepts = {
            "LAN": {
                "title": "Local Area Network (LAN)",
                "definition": "A network connecting devices within a limited area — a trading floor, data center, or office. In fintech, LANs carry ultra-low-latency traffic between trading systems, order management systems (OMS), and market data feeds.",
                "fintech_context": "High-frequency trading firms build dedicated LANs with sub-microsecond latency using kernel bypass (DPDK, RDMA) and co-location facilities. FIX sessions between an OMS and an execution venue often run over a LAN.",
                "examples": [
                    "Trading floor LAN connecting OMS to FIX gateway",
                    "Co-location LAN linking algo engine to exchange matching engine",
                    "Back-office LAN connecting settlement systems"
                ],
                "key_specs": {
                    "Typical Latency": "< 1ms (standard), < 1µs (HFT)",
                    "Bandwidth": "1 Gbps – 100 Gbps",
                    "Protocols": "Ethernet, InfiniBand (HFT)"
                }
            },
            "WAN": {
                "title": "Wide Area Network (WAN)",
                "definition": "A network spanning large geographic areas — connecting a bank's London office to New York, or a broker's systems to multiple global exchanges. WANs introduce higher latency and require robust session management.",
                "fintech_context": "FIX protocol was designed for WAN connectivity between brokers, asset managers, and exchanges. WAN links carry FIX order flow, market data (FAST/ITCH), and settlement messages (SWIFT) across continents. Latency arbitrage strategies exploit WAN delay differences.",
                "examples": [
                    "FIX session between a London hedge fund and NYSE",
                    "SWIFT messages routed over bank WANs for cross-border payments",
                    "Market data (e.g., Bloomberg) distributed via financial WAN"
                ],
                "key_specs": {
                    "Typical Latency": "5ms (NY–Chicago) to 85ms (NY–London)",
                    "Bandwidth": "10 Mbps – 10 Gbps (leased lines)",
                    "Protocols": "MPLS, SD-WAN, leased lines, microwave"
                }
            },
            "TCP_IP": {
                "title": "TCP/IP Protocol Suite",
                "definition": "The foundational protocol stack for internet and financial network communication. TCP (Transmission Control Protocol) provides reliable, ordered delivery with retransmission — essential for FIX. IP (Internet Protocol) handles routing between networks.",
                "fintech_context": "FIX protocol runs over TCP. The TCP three-way handshake establishes FIX sessions; sequence numbers in both TCP and FIX ensure message integrity. TCP's reliability guarantees no order messages are lost, but retransmissions add latency — a key trade-off in algo trading.",
                "examples": [
                    "FIX Logon (MsgType=A) sent over a TCP connection",
                    "TCP retransmission causing a missed fill in a fast market",
                    "UDP used for multicast market data (lower latency, no guarantee)"
                ],
                "key_specs": {
                    "Transport": "TCP (reliable) or UDP (low-latency, best-effort)",
                    "FIX over TCP": "Port 443 (SSL) or custom ports (e.g., 9880)",
                    "OSI Layer": "Layer 3 (IP) + Layer 4 (TCP/UDP)"
                },
                "osi_layers": [
                    {"layer": 7, "name": "Application", "fintech_example": "FIX, SWIFT, FAST"},
                    {"layer": 6, "name": "Presentation", "fintech_example": "SSL/TLS encryption of FIX messages"},
                    {"layer": 5, "name": "Session", "fintech_example": "FIX session (logon, heartbeat, logout)"},
                    {"layer": 4, "name": "Transport", "fintech_example": "TCP (FIX orders), UDP (market data)"},
                    {"layer": 3, "name": "Network", "fintech_example": "IP routing between broker and exchange"},
                    {"layer": 2, "name": "Data Link", "fintech_example": "Ethernet frames on trading floor LAN"},
                    {"layer": 1, "name": "Physical", "fintech_example": "Fiber optic, microwave (HFT latency arbitrage)"}
                ]
            },
            "FIX_SESSION": {
                "title": "FIX Session Layer",
                "definition": "The FIX (Financial Information eXchange) session layer manages the lifecycle of a connection between two financial counterparties: logon, heartbeat, message sequencing, and logout. It maps directly onto TCP/IP session concepts.",
                "fintech_context": "Understanding FIX sessions teaches all core networking concepts at once: TCP for transport, sequence numbers for reliability, heartbeats for keepalive, and resend requests for gap-fill — mirroring TCP's own retransmission mechanics.",
                "examples": [
                    "Logon (35=A): initiator opens TCP connection, sends credentials",
                    "Heartbeat (35=0): sent every N seconds to confirm session is alive",
                    "ResendRequest (35=2): requests re-transmission of missed messages",
                    "Logout (35=5): graceful TCP teardown"
                ],
                "message_flow": [
                    {"step": 1, "msg": "35=A (Logon)", "direction": "Initiator → Acceptor", "tcp_analogy": "TCP SYN"},
                    {"step": 2, "msg": "35=A (Logon Ack)", "direction": "Acceptor → Initiator", "tcp_analogy": "TCP SYN-ACK"},
                    {"step": 3, "msg": "35=D (New Order)", "direction": "Initiator → Acceptor", "tcp_analogy": "Data segment"},
                    {"step": 4, "msg": "35=8 (Execution Report)", "direction": "Acceptor → Initiator", "tcp_analogy": "ACK + data"},
                    {"step": 5, "msg": "35=0 (Heartbeat)", "direction": "Both", "tcp_analogy": "TCP keepalive"},
                    {"step": 6, "msg": "35=5 (Logout)", "direction": "Either", "tcp_analogy": "TCP FIN"}
                ],
                "key_specs": {
                    "Standard": "FIX 4.2 / 4.4 / 5.0 / FIXT 1.1",
                    "Transport": "TCP/IP (port varies by venue)",
                    "Encoding": "Tag=Value (classic) or FIXML (XML)"
                }
            }
        }

    def get_concept(self, name):
        key = name.upper().replace("/", "_").replace("-", "_")
        return self.concepts.get(key, self.concepts.get(name, None))

    def list_concepts(self):
        return list(self.concepts.keys())

    def get_all(self):
        return self.concepts


class FIXMessageSimulator:
    """Simulates FIX protocol messages to teach network concepts."""

    FIELD_TAGS = {
        "8":  "BeginString",
        "9":  "BodyLength",
        "35": "MsgType",
        "49": "SenderCompID",
        "56": "TargetCompID",
        "34": "MsgSeqNum",
        "52": "SendingTime",
        "98": "EncryptMethod",
        "108": "HeartBtInt",
        "10": "CheckSum",
        "11": "ClOrdID",
        "55": "Symbol",
        "54": "Side",
        "38": "OrderQty",
        "40": "OrdType",
        "44": "Price",
        "39": "OrdStatus",
        "14": "CumQty",
        "6":  "AvgPx",
    }

    MSG_TYPES = {
        "0": "Heartbeat",
        "1": "TestRequest",
        "2": "ResendRequest",
        "3": "Reject",
        "4": "SequenceReset",
        "5": "Logout",
        "A": "Logon",
        "D": "NewOrderSingle",
        "8": "ExecutionReport",
        "F": "OrderCancelRequest",
        "G": "OrderCancelReplaceRequest",
        "V": "MarketDataRequest",
        "W": "MarketDataSnapshotFullRefresh",
    }

    def parse_fix_message(self, raw_message):
        """Parse a FIX tag=value string into a structured dict."""
        fields = {}
        delimiter = "|" if "|" in raw_message else "\x01"
        for pair in raw_message.strip().split(delimiter):
            if "=" in pair:
                tag, value = pair.split("=", 1)
                tag = tag.strip()
                label = self.FIELD_TAGS.get(tag, f"Tag{tag}")
                msg_type_label = self.MSG_TYPES.get(value, value) if tag == "35" else value
                fields[tag] = {
                    "label": label,
                    "value": msg_type_label if tag == "35" else value,
                    "raw_value": value
                }
        return fields

    def build_sample_message(self, msg_type="D"):
        """Return a sample FIX message string for a given type."""
        samples = {
            "A": "8=FIX.4.4|9=73|35=A|49=BROKER1|56=EXCHANGE1|34=1|52=20240101-09:00:00|98=0|108=30|10=099|",
            "D": "8=FIX.4.4|9=120|35=D|49=BROKER1|56=EXCHANGE1|34=2|52=20240101-09:00:01|11=ORD001|55=AAPL|54=1|38=100|40=2|44=185.50|10=042|",
            "8": "8=FIX.4.4|9=150|35=8|49=EXCHANGE1|56=BROKER1|34=3|52=20240101-09:00:01|11=ORD001|55=AAPL|54=1|38=100|40=2|44=185.50|39=2|14=100|6=185.50|10=077|",
            "0": "8=FIX.4.4|9=60|35=0|49=BROKER1|56=EXCHANGE1|34=5|52=20240101-09:00:30|10=101|",
            "5": "8=FIX.4.4|9=60|35=5|49=BROKER1|56=EXCHANGE1|34=6|52=20240101-09:05:00|10=088|",
        }
        return samples.get(msg_type, samples["D"])
