from pdl.pdl import exec_dict

hello = {
    "text": [
        "Hello,",
        {
            "model": "ibm/granite-34b-code-instruct",
            "platform": "bam",
            "parameters": {"stop_sequences": ["!"], "include_stop_sequence": True},
        },
    ]
}


def main():
    result = exec_dict(hello)
    print(result)


if __name__ == "__main__":
    main()
