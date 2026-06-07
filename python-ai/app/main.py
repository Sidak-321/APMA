from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "python-ai"})

# Stub endpoints — implemented in Phase 2 and 3
@app.post("/embed")
def embed():
    return jsonify({"status": "not_implemented", "phase": 2}), 501

@app.post("/run-agent")
def run_agent():
    return jsonify({"status": "not_implemented", "phase": 3}), 501

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)