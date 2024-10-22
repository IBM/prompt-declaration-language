from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello\n",
        {
            "model": "replicate/ibm-granite/granite-3.0-8b-instruct",
            "parameters": {"stop_sequences": "!"},
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
