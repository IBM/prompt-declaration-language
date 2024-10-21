from pdl.pdl import exec_str

HELLO = """
text:
- "Hello\n"
- model: replicate/ibm-granite/granite-3.0-8b-instruct
  parameters:
    stop_sequences: '!'
"""


def main():
    result = exec_str(HELLO)
    print(result)


if __name__ == "__main__":
    main()
