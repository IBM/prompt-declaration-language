from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello,",
        {
            "model": "watsonx/ibm/granite-20b-code-instruct",
            "parameters": {"stop": ["!"], "include_stop_sequence": True},
        },
        "\n",
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
