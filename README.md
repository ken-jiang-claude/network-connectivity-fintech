# Network Connectivity for Fintech

> An interactive learning platform for financial technology professionals — teaching LAN, WAN, TCP/IP, and FIX protocol through real-world fintech scenarios.

**Live App:** https://network-connectivity-fintech.onrender.com  
**GitHub:** https://github.com/ken-jiang-claude/network-connectivity-fintech  
**Owner:** Ken Jiang | **Version:** 1.0 | **Status:** Active

---

## What Is This?

Fintech professionals — FIX connectivity engineers, algo traders, and operations staff — need to understand how network connectivity underpins every trade. This platform teaches core concepts through the lens of FIX protocol, with interactive tools that mirror real trading system behaviour.

---

## Features

| Tab | What You Learn |
|---|---|
| **Concepts** | LAN, WAN, TCP/IP, and FIX Session — each with fintech context, real examples, and key specs. Click any card for a deep-dive. |
| **OSI & FIX** | All 7 OSI layers mapped to FIX and trading systems. Step through the FIX session lifecycle (Logon → Order → Fill → Heartbeat → Logout) with TCP analogies. |
| **FIX Simulator** | Load sample FIX messages (Logon, New Order, Execution Report, Heartbeat, Logout) or paste any raw FIX string to parse it tag-by-tag. |
| **Troubleshoot** | 5 real fintech scenarios — FIX session drops, latency spikes, sequence gaps, no connectivity, missing market data — each with symptoms, causes, and step-by-step resolution. Plus a live ping tool. |
| **Quiz** | 5 scenario-based questions testing practical understanding of fintech networking. Immediate feedback with explanations. |

---

## Screenshots

### Concepts Tab
Learn LAN, WAN, TCP/IP, and FIX Session with fintech-specific context — trading floor LANs, transatlantic WAN latency, and FIX over TCP.

### FIX Simulator
Parse any FIX `tag=value` message into a structured field breakdown:
```
8   BeginString  = FIX.4.4
35  MsgType      = NewOrderSingle
49  SenderCompID = BROKER1
55  Symbol       = AAPL
54  Side         = 1 (Buy)
38  OrderQty     = 100
44  Price        = 185.50
```

### Troubleshoot Tab
Select a real fintech scenario and get a structured diagnosis — with OSI layer, relevant FIX tags, symptoms, causes, and numbered resolution steps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Web Framework | Flask 3.0 |
| Production Server | Gunicorn |
| Frontend | HTML5, CSS3, Vanilla JS |
| Hosting | Render.com (auto-deploy from GitHub) |
| Version Control | GitHub |

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/concepts` | GET | All network concepts (LAN, WAN, TCP/IP, FIX Session) |
| `/api/concepts/<name>` | GET | Single concept by name |
| `/api/fix/sample/<type>` | GET | Sample FIX message (A, D, 8, 0, 5) |
| `/api/fix/parse` | POST | Parse a raw FIX tag=value string |
| `/api/diagnose` | POST | Diagnose a network issue from text description |
| `/api/ping` | POST | Ping a host for Layer 3 connectivity check |
| `/api/quiz` | GET | Retrieve the 5 quiz questions |

---

## Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/ken-jiang-claude/network-connectivity-fintech.git
cd network-connectivity-fintech
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Run the app**
```bash
python src/app.py
```

**4. Open in browser**
```
http://localhost:5000
```

---

## Project Documentation

| Document | Description |
|---|---|
| [PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md) | Full PM doc — Business Justification, ROI, RACI, RICE, Milestones, Testing Plan, SDLC, Gantt Chart |
| [network-connectivity-fintech-intro.pptx](docs/network-connectivity-fintech-intro.pptx) | Bloomberg terminal-themed intro deck (8 slides) |

---

## Roadmap

| Version | Target | Features |
|---|---|---|
| **v1.0** ✅ | Apr 2026 | Core platform — Concepts, OSI Explorer, FIX Simulator, Troubleshoot, Quiz |
| **v1.1** | Aug 2026 | Live FIX sandbox (connect to real QuickFIX/J test acceptor) |
| **v1.2** | Oct 2026 | Market data feed simulator (UDP multicast, FAST protocol) |
| **v2.0** | Dec 2026 | Multi-user mode, progress tracking, certification badge |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Network Connectivity for Fintech | v1.0 | April 2026 | Ken Jiang*
