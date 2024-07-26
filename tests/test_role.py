from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

role_data = {
    "description": "Role test",
    "document": {
        {
          "role": "system",
          "document": "You are Granite"
        },
        {
          "role": "user",
          "document": "Hello"
        },
        {
          "role": "assistant",
          "model": "ibm/granite-13b-chat-v2",
          "platform": "bam"
        }
    },
}


def test_role():
    state = InterpreterState()
    data = Program.model_validate(role_data)
    result, document, _, _ = process_prog(state, empty_scope, data)
    assert document == [("system", "You are Granite"), ("user", "Hello"), ("assistant", "TODO")]

