import litellm
print("before call")
response= litellm.completion(
    api_base="https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-02",
    model="watsonx_text/meta-llama/llama-3-1-70b-instruct",
    messages=[
        {"role": "system", "content": "You are such a good LLM."},
        {"role": "user", "content": "Tell me a joke about dogs."},
    ],
)
print(f"response.to_json() {response.to_json()}\n")