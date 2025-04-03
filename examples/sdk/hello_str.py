from pdl.pdl import exec_str

HELLO = """
text:
- "Hello\n"
- model: ollama_chat/granite3.2:8b
  parameters:
    stop_sequences: '!'
"""


def main():
    result = exec_str(HELLO)
    print(result)


if __name__ == "__main__":
    main()
