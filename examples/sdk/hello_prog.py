from pdl.pdl import exec_program
from pdl.pdl_ast import LitellmModelBlock, LitellmParameters, Program, TextBlock

hello = Program(
    TextBlock(
        text=[
            "Hello\n",
            LitellmModelBlock(
                model="replicate/ibm-granite/granite-3.0-8b-instruct",
                parameters=LitellmParameters(stop_sequences="!"),  # pyright: ignore
            ),
        ]
    )
)


def main():
    result = exec_program(hello)
    print(result)


if __name__ == "__main__":
    main()
