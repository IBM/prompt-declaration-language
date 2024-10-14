from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello,",
        {
            "model": "watsonx/ibm/granite-34b-code-instruct",
            "parameters": {"stop": ["!"], "include_stop_sequence": True},
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
