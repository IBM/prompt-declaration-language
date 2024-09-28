from pdl.pdl import exec_program
from pdl.pdl_ast import LitellmModelBlock, LitellmParameters, Program, TextBlock

hello = Program(
    TextBlock(
        text=[
            "Hello,",
            LitellmModelBlock(
                model="watsonx/ibm/granite-20b-code-instruct",
                parameters=LitellmParameters(
                    stop=["!"], include_stop_sequence=True  # pyright: ignore
                ),
            ),
            "\n",
        ]
    )
)


def main():
    result = exec_program(hello)
    print(result)


if __name__ == "__main__":
    main()
