from flask import Flask, render_template, request, jsonify
from network import NetworkConcepts, FIXMessageSimulator
from troubleshoot import diagnose_network_issue, check_ping, get_all_scenarios, get_quiz

app = Flask(__name__)

network = NetworkConcepts()
fix_sim = FIXMessageSimulator()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/concepts", methods=["GET"])
def get_concepts():
    return jsonify(network.get_all())


@app.route("/api/concepts/<name>", methods=["GET"])
def get_concept(name):
    concept = network.get_concept(name)
    if concept:
        return jsonify(concept)
    return jsonify({"error": f"Concept '{name}' not found."}), 404


@app.route("/api/scenarios", methods=["GET"])
def get_scenarios():
    return jsonify(get_all_scenarios())


@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    data = request.get_json()
    description = data.get("description", "")
    if not description:
        return jsonify({"error": "No description provided."}), 400
    result = diagnose_network_issue(description)
    return jsonify(result)


@app.route("/api/ping", methods=["POST"])
def ping():
    data = request.get_json()
    host = data.get("host", "").strip()
    if not host:
        return jsonify({"error": "No host provided."}), 400
    # Basic input validation — only allow hostnames/IPs, no shell metacharacters
    import re
    if not re.match(r'^[a-zA-Z0-9.\-]+$', host):
        return jsonify({"error": "Invalid host format."}), 400
    result = check_ping(host)
    return jsonify(result)


@app.route("/api/fix/parse", methods=["POST"])
def parse_fix():
    data = request.get_json()
    raw = data.get("message", "")
    if not raw:
        return jsonify({"error": "No FIX message provided."}), 400
    parsed = fix_sim.parse_fix_message(raw)
    return jsonify(parsed)


@app.route("/api/fix/sample/<msg_type>", methods=["GET"])
def fix_sample(msg_type):
    sample = fix_sim.build_sample_message(msg_type.upper())
    return jsonify({"raw": sample, "msg_type": msg_type.upper()})


@app.route("/api/quiz", methods=["GET"])
def quiz():
    return jsonify(get_quiz())


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
