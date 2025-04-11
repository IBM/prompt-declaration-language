from pdl.pdl import exec_str

HELLO = """
text:
- "Hello\n"
- model: ollama_chat/granite3.2:2b
  parameters:
    stop: ['!']
"""


def main():
    result = exec_str(HELLO)
    print(result)


if __name__ == "__main__":
    main()
