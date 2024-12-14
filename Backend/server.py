from flask import Flask, request, jsonify
from huggingface_hub import InferenceClient
from hashlib import sha256
import subprocess
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

api_key = os.getenv('HUGGINGFACE_API_KEY')
if not api_key:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is not set")

client = InferenceClient(api_key=api_key)


def generate_hash(data):
    return sha256(data.encode('utf-8')).hexdigest()


def generate_zkp(metadata_hash, ai_output_hash, validation_result):

    with open("input.json", "w") as f:
        f.write(f"""{{
            "metadata_hash": "{metadata_hash}",
            "ai_output_hash": "{ai_output_hash}",
            "validation_result": {validation_result}
        }}""")

    try:
        subprocess.run(["snarkjs", "groth16", "fullprove", "input.json",
                        "validate_metadata.wasm", "validate_metadata.zkey", "proof.json"],
                       check=True)

        with open("proof.json") as f:
            return f.read()
    except subprocess.CalledProcessError as e:
        raise Exception(f"Error generating ZKP: {str(e)}")


@app.route('/validate_metadata', methods=['POST'])
def validate_metadata():
    data = request.json
    property_name = data['property_name']
    address = data['address']
    price = data['price']

    prompt = f"""
    You are an expert real estate validator. A user has provided the following property metadata for validation:
    1. Property Name: {property_name}
    2. Address: {address}
    3. Price: {price}
    Respond with: 'Valid' or 'Invalid' for each field, with reasons.
    """

    messages = [{"role": "user", "content": prompt}]
    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.2-3B-Instruct",
            messages=messages,
            max_tokens=500
        )
        llm_response = completion.choices[0].message["content"]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    validation_result = 1 if "Valid" in llm_response else 0
    metadata_str = f"{property_name}|{address}|{price}"
    metadata_hash = generate_hash(metadata_str)
    ai_output_hash = generate_hash(llm_response)

    try:
        proof = generate_zkp(metadata_hash, ai_output_hash, validation_result)
    except Exception as e:
        return jsonify({"error": f"ZKP Generation Failed: {str(e)}"}), 500

    return jsonify({
        "validation_result": llm_response,
        "proof": proof,
        "public_inputs": {
            "metadata_hash": metadata_hash,
            "validation_result": validation_result
        }
    })


if __name__ == '__main__':
    app.run(debug=True)
