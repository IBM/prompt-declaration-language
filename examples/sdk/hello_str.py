from pdl.pdl import exec_str

HELLO = """
text:
- Hello,
- model: watsonx/ibm/granite-34b-code-instruct
  parameters:
    stop:
    - '!'
    include_stop_sequence: true
"""


def main():
    result = exec_str(HELLO)
    print(result)


if __name__ == "__main__":
    main()
