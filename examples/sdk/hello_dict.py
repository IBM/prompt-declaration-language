from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello\n",
        {
            "model": "ollama_chat/granite3.2:2b",
            "parameters": {
                "stop": ["!"],
            },
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
