# Network Connectivity for Fintech
## Project Status Update

**Date:** April 6, 2026 | **Version:** 1.0 | **Owner:** Ken Jiang | **Sprint:** 1 of 4

---

## RAG Status Summary

| Area | Status | Comment |
|---|:---:|---|
| Overall Project | 🟢 **GREEN** | On track — all v1.0 deliverables complete and live |
| Development | 🟢 **GREEN** | All 5 tabs deployed: Concepts, OSI & FIX, FIX Simulator, Troubleshoot, Quiz |
| Deployment | 🟢 **GREEN** | Live at network-connectivity-fintech.onrender.com |
| Budget | 🟢 **GREEN** | $0 spend — Render free tier, no external API dependencies |
| Timeline | 🟢 **GREEN** | M1–M5 complete; M6 user feedback iteration starts May 2026 |
| Documentation | 🟢 **GREEN** | README, PM doc, Bloomberg PPTX deck, Project Status all complete |
| User Adoption | 🟡 **AMBER** | Platform launched; active adoption tracking not yet started |
| Feature Backlog | 🟡 **AMBER** | RICE backlog defined; Sprint 2 enhancements (v1.1) not yet started |

---

## Milestone Progress

| # | Milestone | Target | Status |
|---|---|---|:---:|
| M1 | Project Kickoff & Requirements | Apr 2026 | ✅ Complete |
| M2 | Core App MVP (Concepts + OSI tab) | Apr 2026 | ✅ Complete |
| M3 | Full Feature Release (all 5 tabs) | Apr 2026 | ✅ Complete |
| M4 | Cloud Deployment (Render.com) | Apr 2026 | ✅ Complete |
| M5 | Documentation & Slide Deck | Apr 2026 | ✅ Complete |
| M6 | User Feedback & Iteration (v1.1) | May 2026 | 🔄 Planned |
| M7 | v1.1 — Live FIX Sandbox (QuickFIX/J) | Aug 2026 | 🔄 Planned |
| M8 | v1.2 — Market Data Feed Simulator | Oct 2026 | 🔄 Planned |
| M9 | v2.0 — Multi-user & Certification | Dec 2026 | 🔄 Planned |

---

## RAID Log

### Risks

| ID | Risk | Probability | Impact | Severity | Mitigation | Owner |
|---|---|:---:|:---:|:---:|---|---|
| R01 | Render.com free tier spins down after 15 min idle — slow cold start during demo | High | Medium | 🟡 Medium | Open URL 2 min before any demo; upgrade to paid tier ($7/mo) for interviews | Ken Jiang |
| R02 | FIX content inaccuracy — incorrect tag numbers or session behaviour described | Medium | High | 🟠 High | All FIX content reviewed against FIX 4.4 spec; NET-SME review planned for v1.1 | Ken Jiang |
| R03 | Ping tool misused to probe internal network hosts | Low | Medium | 🟡 Medium | Input validated with regex `[a-zA-Z0-9.\-]`; no shell passthrough possible | Ken Jiang |
| R04 | QuickFIX/J firewall blocks v1.1 Live FIX Sandbox | Medium | High | 🟠 High | Deploy QuickFIX/J test acceptor on cloud VM; test connectivity before feature build | Ken Jiang |
| R05 | Key person dependency — single developer owns all code and content | Low | High | 🟠 High | Codebase is open source on GitHub; architecture documented in README and PM doc | Ken Jiang |

---

### Assumptions

| ID | Assumption | Impact if Wrong | Status |
|---|---|---|:---:|
| A01 | Users have a modern browser (Chrome/Edge) | UI may break on older browsers | ✅ Valid |
| A02 | Render.com free tier is sufficient for demo and early adoption | May need to upgrade to paid tier ($7/mo) | ✅ Valid |
| A03 | The target firm runs ~8 FIX network incidents per month (basis of ROI) | ROI figures would need recalculation | 🔄 To validate |
| A04 | FIX 4.4 is the primary protocol version in use at the target firm | Content may need updating for FIX 4.2 or 5.0 SP2 users | 🔄 To validate |
| A05 | Users are comfortable using a public browser-based tool for learning exercises | Sensitive network config data must not be entered into the platform | ✅ Valid |
| A06 | Gunicorn + Render.com handles up to 5 concurrent users on free tier | May need horizontal scaling for team-wide rollout | ✅ Valid |

---

### Issues

| ID | Issue | Raised | Priority | Status | Resolution |
|---|---|---|:---:|:---:|---|
| I01 | Flask 2.2.3 incompatible with newer Werkzeug — ImportError on startup | Apr 6, 2026 | 🔴 High | ✅ Resolved | Upgraded to Flask 3.0 + Werkzeug 3.0 via pip |
| I02 | `python` command not on PATH in bash shell on Windows | Apr 6, 2026 | 🟡 Medium | ✅ Resolved | Use full path: `C:\Users\Taikary Jiang\AppData\Local\Programs\Python\Python312\python.exe` |
| I03 | Flask server stopping when terminal session closes (background process) | Apr 6, 2026 | 🟡 Medium | ✅ Resolved | Use Render.com for persistent hosting; run locally with PowerShell window kept open |
| I04 | Git repo initialised in wrong directory on first attempt | Apr 6, 2026 | 🟡 Medium | ✅ Resolved | Re-initialised in correct `network-connectivity-tool/` directory |
| I05 | Render.com cold start causes ~30s delay after 15 min idle | Apr 6, 2026 | 🟡 Medium | 🔄 Open | Workaround: open URL 2 min before demo; upgrade to paid tier for production use |

---

### Dependencies

| ID | Dependency | Type | Status | Risk if Unavailable |
|---|---|---|:---:|---|
| D01 | Render.com hosting | External | ✅ Active | App offline; no public URL |
| D02 | GitHub (`ken-jiang-claude/network-connectivity-fintech`) | External | ✅ Active | No version control or auto-deploy trigger |
| D03 | Python 3.12 + Flask 3.0 + Gunicorn | Internal | ✅ Installed | Local development and production server unavailable |
| D04 | FIX Protocol 4.4 specification (reference standard) | External reference | ✅ Active | FIX simulator and scenario content accuracy unverifiable |
| D05 | QuickFIX/J test acceptor (for v1.1 Live FIX Sandbox) | External | 🔄 Planned | v1.1 feature blocked until deployed on cloud VM |
| D06 | python-docx + pptxgenjs (for document generation) | Internal tooling | ✅ Installed | PM doc and Bloomberg deck cannot be regenerated |

---

## Next Actions

| # | Action | Owner | Due | Priority |
|---|---|---|---|:---:|
| 1 | Begin user feedback collection from 3+ FIX engineers / algo traders | Ken Jiang | May 15, 2026 | 🔴 High |
| 2 | Validate ROI assumption A03 — confirm actual FIX incident rate with ops team | Ken Jiang | May 15, 2026 | 🔴 High |
| 3 | Implement Latency Calculator feature (RICE: 176 — next highest priority) | Ken Jiang | May 31, 2026 | 🔴 High |
| 4 | Implement Certification Badge after quiz pass (RICE: 64) | Ken Jiang | Jun 15, 2026 | 🟡 Medium |
| 5 | Deploy QuickFIX/J test acceptor on cloud VM for v1.1 FIX sandbox | Ken Jiang | Jun 2026 | 🟡 Medium |
| 6 | Upgrade Render.com to paid tier before any live interview demo | Ken Jiang | Before next demo | 🟡 Medium |
| 7 | NET-SME review of all FIX content for accuracy against FIX 4.4 spec | Ken Jiang | May 2026 | 🟡 Medium |

---

*Status update prepared by Ken Jiang | April 6, 2026 | github.com/ken-jiang-claude/network-connectivity-fintech*
