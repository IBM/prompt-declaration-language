from flask import Flask, jsonify, request
from pdl import pdl
app = Flask(__name__)


@app.route('/exec_str', methods=['POST'])
def get_exec_str():
    args = request.get_json()
    result = pdl.exec_str(**args)
    return jsonify(result)

