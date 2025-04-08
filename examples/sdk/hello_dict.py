from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello\n",
        {
            "model": "ollama_chat/granite3.2:8b",
            "parameters": {"stop_sequences": "!"},
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
