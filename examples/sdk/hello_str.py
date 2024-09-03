from pdl.pdl import exec_str

hello = """
document:
- Hello,
- model: watsonx/ibm/granite-20b-code-instruct
  parameters:
    stop:
    - '!'
    include_stop_sequence: true
- "\n"
"""


def main():
    result = exec_str(hello)
    print(result)


if __name__ == "__main__":
    main()
