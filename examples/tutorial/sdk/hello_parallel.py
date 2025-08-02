import concurrent.futures

from pdl.pdl import exec_str

HELLO = """
text:
- >+
  Hello, my name is ${name}
- model: ollama_chat/granite3.2:2b
"""


def _run_agent(name):
    pdl_output = exec_str(
        HELLO,
        scope={"name": name},
        config={
            "yield_result": False,
            "yield_background": False,
            "batch": 1,  # disable streaming
        },
    )
    return pdl_output


if __name__ == "__main__":
    data = ["Alice", "Nicolas", "Rosa", "Remi"]
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = {executor.submit(_run_agent, name) for name in data}
        executor.map(_run_agent, data)
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
            except Exception as e:
                print(f"Task raised an exception: {e}")
            else:
                print(result)
