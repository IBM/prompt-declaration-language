from pdl.pdl import exec_dict


def main():
    hello = {
        "text": [
            "Hello\n",
            {
                "model": "ollama_chat/granite4:1b",
                "parameters": {
                    "stop": ["!"],
                },
            },
        ]
    }
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
