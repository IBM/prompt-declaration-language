from pdl.pdl import exec_program
from pdl.pdl_ast import LitellmModelBlock, LitellmParameters, Program, TextBlock


def main():
    hello = Program(
        TextBlock(
            text=[
                "Hello\n",
                LitellmModelBlock(
                    model="ollama_chat/granite4:1b",
                    parameters=LitellmParameters(stop=["!"]),
                ),
            ]
        )
    )
    result = exec_program(hello)
    print(result)


if __name__ == "__main__":
    main()
