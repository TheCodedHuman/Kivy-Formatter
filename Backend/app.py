from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/format-kv", methods=["POST"])
def hello_world():
    data = request.get_json()
    kv_text = data.get("kv_text", "")

    response = {
        "parsed": {
            "BoxLayout": {
                "props": {"orientation": "vertical"},
                "children": []
            }
        }
    }
    return jsonify(response)
