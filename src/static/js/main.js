/* ============================================================
   Network Connectivity for Fintech — main.js
   ============================================================ */

// ---- Tab Navigation ----
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
    });
});

// ============================================================
// CONCEPTS TAB
// ============================================================
const ICONS = { LAN: 'LAN', WAN: 'WAN', TCP_IP: 'TCP', FIX_SESSION: 'FIX' };
const CARD_COLORS = { LAN: '', WAN: '', TCP_IP: '', FIX_SESSION: 'fix-card' };

async function loadConcepts() {
    const res = await fetch('/api/concepts');
    const data = await res.json();
    const grid = document.getElementById('concept-grid');
    grid.innerHTML = '';

    for (const [key, concept] of Object.entries(data)) {
        const card = document.createElement('div');
        card.className = 'concept-card ' + (CARD_COLORS[key] || '');
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">${ICONS[key] || key.slice(0,3)}</div>
                <h3>${concept.title || key}</h3>
            </div>
            <div class="card-body">
                <p>${concept.definition}</p>
                <ul class="card-examples">
                    ${(concept.examples || []).slice(0, 3).map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
        card.addEventListener('click', () => openConceptDetail(concept, key));
        grid.appendChild(card);
    }
}

function openConceptDetail(concept, key) {
    const overlay = document.getElementById('concept-overlay');
    const box = document.getElementById('concept-detail-content');

    let specsHTML = '';
    if (concept.key_specs) {
        specsHTML = `<div class="detail-section">
            <h4>Key Specifications</h4>
            <div class="spec-grid">
                ${Object.entries(concept.key_specs).map(([k, v]) =>
                    `<div class="spec-item"><strong>${k}</strong>${v}</div>`
                ).join('')}
            </div>
        </div>`;
    }

    let flowHTML = '';
    if (concept.message_flow) {
        flowHTML = `<div class="detail-section">
            <h4>Message Flow (TCP Analogy)</h4>
            <table style="width:100%;border-collapse:collapse;font-size:0.83rem;">
                <thead><tr style="background:var(--primary);color:#fff;">
                    <th style="padding:6px 10px;">Step</th>
                    <th style="padding:6px 10px;">FIX Message</th>
                    <th style="padding:6px 10px;">Direction</th>
                    <th style="padding:6px 10px;">TCP Analogy</th>
                </tr></thead>
                <tbody>${concept.message_flow.map(s =>
                    `<tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:6px 10px;">${s.step}</td>
                        <td style="padding:6px 10px;font-family:monospace;">${s.msg}</td>
                        <td style="padding:6px 10px;">${s.direction}</td>
                        <td style="padding:6px 10px;color:var(--text-muted);">${s.tcp_analogy}</td>
                    </tr>`
                ).join('')}</tbody>
            </table>
        </div>`;
    }

    box.innerHTML = `
        <h2 style="color:var(--primary);margin-bottom:10px;">${concept.title || key}</h2>
        <p style="color:var(--text-muted);margin-bottom:14px;">${concept.definition}</p>
        <div class="detail-section">
            <h4>Fintech Context</h4>
            <p style="font-size:0.88rem;">${concept.fintech_context || ''}</p>
        </div>
        <div class="detail-section">
            <h4>Real-World Examples</h4>
            <ul class="card-examples">
                ${(concept.examples || []).map(e => `<li>${e}</li>`).join('')}
            </ul>
        </div>
        ${specsHTML}
        ${flowHTML}
    `;
    overlay.classList.add('open');
}

// Concept detail overlay close
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'concept-detail-overlay';
    overlay.id = 'concept-overlay';
    overlay.innerHTML = `
        <div class="concept-detail-box">
            <button class="detail-close" id="detail-close-btn">&times;</button>
            <div id="concept-detail-content"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('detail-close-btn').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

    loadConcepts();
    loadOSI();
    loadFlowDiagram();
    loadScenarios();
    loadQuiz();
});

// ============================================================
// OSI + FIX TAB
// ============================================================
const OSI_DATA = [
    {
        layer: 7, name: 'Application',
        fintech_example: 'FIX, SWIFT, FAST, FIXML',
        description: 'The top layer where financial applications live. FIX messages (orders, executions, market data) are application-layer constructs. SWIFT messages (MT103 for payments) also operate here.',
        fix_detail: 'New Order Single (35=D), Execution Report (35=8), MarketDataRequest (35=V) are all application-layer FIX messages.'
    },
    {
        layer: 6, name: 'Presentation',
        fintech_example: 'SSL/TLS encryption of FIX sessions',
        description: 'Handles data formatting and encryption. FIX sessions over public networks use TLS (formerly SSL) to encrypt the tag=value stream. FIXML is an XML encoding at this layer.',
        fix_detail: 'Encrypted FIX (FixSession over TLS) protects order flow from interception. Certificates must be validated on both sides.'
    },
    {
        layer: 5, name: 'Session',
        fintech_example: 'FIX session management (Logon/Heartbeat/Logout)',
        description: 'Manages connection lifecycle — establishment, keepalive, and teardown. FIX\'s own session layer (Logon 35=A, Heartbeat 35=0, Logout 35=5, ResendRequest 35=2) is a direct implementation of Layer 5 concepts.',
        fix_detail: 'FIX sequence numbers (Tag 34) ensure ordered, gap-free delivery. ResendRequest (35=2) and SequenceReset (35=4) recover from gaps — mirroring TCP\'s retransmission.'
    },
    {
        layer: 4, name: 'Transport',
        fintech_example: 'TCP for FIX orders, UDP for market data multicast',
        description: 'Provides end-to-end data delivery. FIX uses TCP for guaranteed delivery of orders. Market data feeds (e.g., CME MDP 3.0, NASDAQ ITCH) use UDP multicast for low-latency broadcast at the cost of reliability.',
        fix_detail: 'TCP port numbers identify FIX sessions. Ephemeral ports on the client side, well-known ports on the exchange side (e.g., 9880, 9443). TCP window size affects throughput on high-latency WAN links.'
    },
    {
        layer: 3, name: 'Network',
        fintech_example: 'IP routing between broker and exchange',
        description: 'Routes packets across networks. Every FIX message is broken into IP packets routed through LANs, WANs, and exchange infrastructure. Traceroute operates at this layer to diagnose path issues.',
        fix_detail: 'Co-location reduces the number of IP hops to near-zero. Cross-connects within a data center (e.g., Equinix NY4) bypass internet routing entirely for microsecond-level latency.'
    },
    {
        layer: 2, name: 'Data Link',
        fintech_example: 'Ethernet on trading floor LAN, InfiniBand in HFT',
        description: 'Handles node-to-node delivery on the same network segment. Standard trading uses Gigabit or 10GbE Ethernet. Ultra-low-latency HFT uses InfiniBand or kernel-bypass technologies (DPDK, RDMA) at this layer.',
        fix_detail: 'MAC address tables in switches direct frames. VLAN segmentation isolates trading traffic from general office traffic on the same physical LAN.'
    },
    {
        layer: 1, name: 'Physical',
        fintech_example: 'Fiber optic, microwave (HFT latency arbitrage)',
        description: 'The actual transmission medium. Fiber optic cables connect exchanges and data centers. Microwave towers (Chicago–NY) offer lower latency than fiber (~4ms vs ~7ms) due to the speed of light in air vs glass — a key tool in latency arbitrage.',
        fix_detail: 'Physical layer latency is fundamental to co-location value. Direct cross-connect cables (shortest physical path) give co-located firms nanosecond advantages over firms using longer cable runs.'
    }
];

function loadOSI() {
    const stack = document.getElementById('osi-stack');
    stack.innerHTML = '';
    OSI_DATA.forEach((layer, i) => {
        const el = document.createElement('div');
        el.className = `osi-layer layer-${layer.layer}`;
        el.innerHTML = `
            <div class="osi-layer-num">${layer.layer}</div>
            <span class="osi-layer-name">${layer.name}</span>
        `;
        el.addEventListener('click', () => {
            document.querySelectorAll('.osi-layer').forEach(l => l.classList.remove('active'));
            el.classList.add('active');
            showOSIDetail(layer);
        });
        stack.appendChild(el);
    });
}

function showOSIDetail(layer) {
    const detail = document.getElementById('osi-detail');
    detail.innerHTML = `
        <h4>Layer ${layer.layer} — ${layer.name}</h4>
        <span class="fintech-badge">${layer.fintech_example}</span>
        <p style="font-size:0.9rem;margin-bottom:12px;">${layer.description}</p>
        <div style="background:var(--fix-bg);border-radius:6px;padding:12px;font-family:monospace;font-size:0.82rem;color:var(--fix-text);">
            <strong style="color:var(--accent2);">FIX Detail:</strong><br>${layer.fix_detail}
        </div>
    `;
}

// ---- FIX Flow Diagram ----
const FLOW_STEPS = [
    { step: 1, msg: '35=A (Logon)', direction: 'Initiator → Acceptor', tcp_analogy: 'TCP SYN — initiates connection', detail: 'Broker sends Logon with SenderCompID (49), TargetCompID (56), HeartBtInt (108), and MsgSeqNum=1. The acceptor (exchange) validates credentials.' },
    { step: 2, msg: '35=A (Logon Acknowledgement)', direction: 'Acceptor → Initiator', tcp_analogy: 'TCP SYN-ACK — connection accepted', detail: 'Exchange responds with its own Logon. Both sides are now in an ESTABLISHED session state. MsgSeqNum on both sides is synchronized.' },
    { step: 3, msg: '35=D (New Order Single)', direction: 'Initiator → Acceptor', tcp_analogy: 'TCP data segment', detail: 'Broker sends an order: Symbol (55=AAPL), Side (54=1 Buy), OrderQty (38=100), OrdType (40=2 Limit), Price (44=185.50). MsgSeqNum increments.' },
    { step: 4, msg: '35=8 (Execution Report)', direction: 'Acceptor → Initiator', tcp_analogy: 'TCP ACK + response data', detail: 'Exchange confirms: OrdStatus (39=2 Filled), CumQty (14=100), AvgPx (6=185.50). The broker\'s OMS updates position and P&L.' },
    { step: 5, msg: '35=0 (Heartbeat)', direction: 'Both sides', tcp_analogy: 'TCP keepalive', detail: 'Every HeartBtInt seconds (e.g., 30s), each side sends a Heartbeat to confirm the session is alive. A missed heartbeat triggers a TestRequest (35=1) before disconnect.' },
    { step: 6, msg: '35=5 (Logout)', direction: 'Either side', tcp_analogy: 'TCP FIN — graceful teardown', detail: 'Either party can initiate logout. The receiver responds with its own Logout, then both sides close the TCP connection. Final MsgSeqNums are preserved for the next session.' }
];

let currentFlowStep = 0;

function loadFlowDiagram() {
    showFlowStep(0);
    document.getElementById('flow-next').addEventListener('click', () => {
        if (currentFlowStep < FLOW_STEPS.length - 1) {
            currentFlowStep++;
            showFlowStep(currentFlowStep);
        }
    });
    document.getElementById('flow-prev').addEventListener('click', () => {
        if (currentFlowStep > 0) {
            currentFlowStep--;
            showFlowStep(currentFlowStep);
        }
    });
}

function showFlowStep(idx) {
    const s = FLOW_STEPS[idx];
    document.getElementById('flow-diagram').innerHTML = `
        <div class="flow-step">
            <div class="flow-msg">[ ${s.msg} ]</div>
            <div class="flow-direction">&#8594; ${s.direction}</div>
            <div class="flow-analogy">TCP analogy: ${s.tcp_analogy}</div>
            <div style="margin-top:12px;color:#d1d5db;font-size:0.85rem;line-height:1.5;">${s.detail}</div>
        </div>
    `;
    document.getElementById('flow-step-label').textContent = `Step ${idx + 1} of ${FLOW_STEPS.length}`;
    document.getElementById('flow-prev').disabled = idx === 0;
    document.getElementById('flow-next').disabled = idx === FLOW_STEPS.length - 1;
}

// ============================================================
// FIX SIMULATOR TAB
// ============================================================
document.querySelectorAll('.btn-fix').forEach(btn => {
    btn.addEventListener('click', async () => {
        const msgType = btn.dataset.msgtype;
        const res = await fetch(`/api/fix/sample/${msgType}`);
        const data = await res.json();
        document.getElementById('fix-input').value = data.raw;
        await parseFIXMessage(data.raw);
    });
});

document.getElementById('parse-btn').addEventListener('click', async () => {
    const raw = document.getElementById('fix-input').value.trim();
    if (!raw) return;
    await parseFIXMessage(raw);
});

async function parseFIXMessage(raw) {
    const res = await fetch('/api/fix/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: raw })
    });
    const fields = await res.json();
    const out = document.getElementById('parsed-output');

    if (fields.error) {
        out.innerHTML = `<span style="color:var(--danger);">${fields.error}</span>`;
        return;
    }

    out.innerHTML = Object.entries(fields).map(([tag, f]) =>
        `<div class="fix-field">
            <span class="tag-num">${tag}</span>
            <span class="tag-label">${f.label}</span>
            <span class="tag-value">= ${f.value}</span>
        </div>`
    ).join('');
}

// ============================================================
// TROUBLESHOOT TAB
// ============================================================
async function loadScenarios() {
    const res = await fetch('/api/scenarios');
    const data = await res.json();
    const list = document.getElementById('scenario-list');
    list.innerHTML = '';

    for (const [key, scenario] of Object.entries(data)) {
        const item = document.createElement('div');
        item.className = 'scenario-item';
        item.textContent = scenario.title;
        item.addEventListener('click', () => {
            document.querySelectorAll('.scenario-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            showScenario(scenario);
        });
        list.appendChild(item);
    }
}

function showScenario(s) {
    const detail = document.getElementById('scenario-detail');
    const fixTagsHTML = Object.keys(s.fix_tags || {}).length
        ? `<div class="fix-tags-box"><strong style="color:var(--accent2);">Relevant FIX Tags:</strong><br>
            ${Object.entries(s.fix_tags).map(([t, n]) => `Tag ${t} = ${n}`).join('<br>')}</div>`
        : '';

    detail.innerHTML = `
        <h3>${s.title}</h3>
        <span class="layer-badge">${s.network_layer}</span>
        <h4 style="margin-top:12px;font-size:0.85rem;text-transform:uppercase;letter-spacing:.5px;">Symptoms</h4>
        <ul class="symptom-list">${s.symptoms.map(x => `<li>${x}</li>`).join('')}</ul>
        <h4 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:.5px;">Likely Causes</h4>
        <ul class="cause-list">${s.causes.map(x => `<li>${x}</li>`).join('')}</ul>
        <h4 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:.5px;">Resolution Steps</h4>
        <ol class="step-list">${s.steps.map(x => `<li>${x}</li>`).join('')}</ol>
        ${fixTagsHTML}
    `;
}

// Diagnose
document.getElementById('diagnose-btn').addEventListener('click', async () => {
    const desc = document.getElementById('diagnose-input').value.trim();
    if (!desc) return;

    const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc })
    });
    const data = await res.json();

    const resultDiv = document.getElementById('diagnose-result');
    resultDiv.style.display = 'block';

    const fixTagsHTML = Object.keys(data.fix_tags || {}).length
        ? `<div class="fix-tags-box" style="margin-top:10px;"><strong style="color:var(--accent2);">Relevant FIX Tags:</strong><br>
            ${Object.entries(data.fix_tags).map(([t, n]) => `Tag ${t} = ${n}`).join('<br>')}</div>`
        : '';

    resultDiv.innerHTML = `
        <h4 style="color:var(--primary);margin-bottom:8px;">${data.title}</h4>
        <span class="layer-badge">${data.network_layer || ''}</span>
        <ol class="step-list" style="margin-top:10px;">
            ${(data.steps || []).map(s => `<li>${s}</li>`).join('')}
        </ol>
        ${fixTagsHTML}
    `;
});

document.getElementById('diagnose-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('diagnose-btn').click();
});

// Ping
document.getElementById('ping-btn').addEventListener('click', async () => {
    const host = document.getElementById('ping-host').value.trim();
    if (!host) return;

    const btn = document.getElementById('ping-btn');
    btn.textContent = 'Pinging…';
    btn.disabled = true;

    const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host })
    });
    const data = await res.json();

    btn.textContent = 'Ping';
    btn.disabled = false;

    const resultDiv = document.getElementById('ping-result');
    resultDiv.style.display = 'block';
    resultDiv.className = 'ping-result ' + (data.reachable ? 'success' : 'error');
    resultDiv.innerHTML = `
        <strong>${data.reachable ? '✓ ' + data.host + ' is reachable' : '✗ ' + data.host + ' is not reachable'}</strong>
        <div class="ping-output">${data.output}</div>
        ${!data.reachable ? '<p style="margin-top:8px;font-size:0.85rem;">If this is an exchange IP, check firewall rules, DNS resolution, and VPN/leased line connectivity.</p>' : ''}
    `;
});

document.getElementById('ping-host').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('ping-btn').click();
});

// ============================================================
// QUIZ TAB
// ============================================================
let quizAnswers = {};

async function loadQuiz() {
    const res = await fetch('/api/quiz');
    const questions = await res.json();
    renderQuiz(questions);
}

function renderQuiz(questions) {
    quizAnswers = {};
    const container = document.getElementById('quiz-container');
    document.getElementById('quiz-results').style.display = 'none';
    container.style.display = 'flex';
    container.innerHTML = '';

    questions.forEach((q, qi) => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.id = `quiz-card-${q.id}`;
        card.innerHTML = `
            <div class="quiz-q-num">Question ${qi + 1} of ${questions.length}</div>
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((opt, oi) =>
                    `<button class="quiz-option" data-qid="${q.id}" data-oi="${oi}" data-correct="${q.answer}">${opt}</button>`
                ).join('')}
            </div>
            <div class="quiz-explanation" id="quiz-exp-${q.id}" style="display:none;">${q.explanation}</div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => answerQuiz(btn, questions));
    });
}

function answerQuiz(btn, questions) {
    const qid = parseInt(btn.dataset.qid);
    const oi = parseInt(btn.dataset.oi);
    const correct = parseInt(btn.dataset.correct);

    if (quizAnswers[qid] !== undefined) return; // already answered
    quizAnswers[qid] = oi;

    const card = document.getElementById(`quiz-card-${qid}`);
    const options = card.querySelectorAll('.quiz-option');
    options.forEach((o, i) => {
        o.disabled = true;
        if (i === correct) o.classList.add('correct');
        else if (i === oi && oi !== correct) o.classList.add('wrong');
    });

    document.getElementById(`quiz-exp-${qid}`).style.display = 'block';
    card.classList.add(oi === correct ? 'answered-correct' : 'answered-wrong');

    // Check if all answered
    if (Object.keys(quizAnswers).length === questions.length) {
        setTimeout(() => showQuizResults(questions), 600);
    }
}

function showQuizResults(questions) {
    const correct = questions.filter(q => quizAnswers[q.id] === q.answer).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);

    document.getElementById('quiz-container').style.display = 'none';
    const results = document.getElementById('quiz-results');
    results.style.display = 'block';
    document.getElementById('score-display').textContent = `${correct} / ${total}  (${pct}%)`;

    const msg = pct === 100 ? 'Perfect score! You\'re ready for fintech network engineering.'
        : pct >= 80 ? 'Great work! Solid understanding of fintech networking.'
        : pct >= 60 ? 'Good effort. Review the concepts tab and try again.'
        : 'Keep studying! The concepts and OSI tabs will help.';

    document.getElementById('score-display').insertAdjacentHTML('afterend', `<p style="color:var(--text-muted);font-size:0.95rem;">${msg}</p>`);
}

document.getElementById('quiz-restart').addEventListener('click', loadQuiz);
