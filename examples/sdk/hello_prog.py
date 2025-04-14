from pdl.pdl import exec_program
from pdl.pdl_ast import LitellmModelBlock, LitellmParameters, Program, TextBlock

hello = Program(
    TextBlock(
        text=[
            "Hello\n",
            LitellmModelBlock(
                model="ollama_chat/granite3.2:2b",
                parameters=LitellmParameters(stop=["!"]),  # pyright: ignore
            ),
        ]
    )
)


def main():
    result = exec_program(hello)
    print(result)


if __name__ == "__main__":
    main()
