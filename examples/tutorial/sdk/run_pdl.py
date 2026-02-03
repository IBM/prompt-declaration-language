from pdl.pdl import pdl


@pdl
def my_pdl_program(scope):
    """
    model: ${ model }
    input: ${ input }
    """
    return


@pdl
def another(scope):
    """
    defs:
        lib:
            import: lib
    text:
    - ${ lib.hello }
    """


def main():
    result1 = my_pdl_program(
        scope={"model": "ollama_chat/granite4:1b", "input": "Hello\n"}
    )
    result2 = another(scope={})
    print(result1)
    print(result2)


if __name__ == "__main__":
    main()
