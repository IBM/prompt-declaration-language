from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello\n",
        {
            "model": "replicate/ibm-granite/granite-3.0-8b-instruct:8d8fb55950fb8eb2817fc078b7b05a0bd3ecc612d6332d8009fb0c007839192e",
            "parameters": {"stop_sequences": "!"},
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
