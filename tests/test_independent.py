from pdl.pdl import exec_dict

independent_data = {
    "text": [
        "pre",
        { "independent": [
            "a",
            {
                "def": "a_post",
                "data": "${pdl_context}",
                "contribute": []
            },
            "b",
            {
                "def": "b_post",
                "data": "${pdl_context}",
                "contribute": []
            },
            ]
        },
        "post",
        {
            "def": "post_post",
            "data": "${pdl_context}",
            "contribute": []
        },
    ]
}

def test_independent_data():
    result = exec_dict(independent_data, output="all")
    assert result["scope"]["a_post"] == [{"role": "user", "content": "pre", "defsite": "text.0"}]
    assert result["scope"]["b_post"] == [{"role": "user", "content": "pre", "defsite": "text.0"}]
    assert result["scope"]["post_post"] == [{"role": "user", "content": "pre", "defsite": "text.0"},
                                            {"role": "user", "content": "a", "defsite": "text.1.independent.0"},
                                            {"role": "user", "content": "b", "defsite": "text.1.independent.2"},
                                            {"role": "user", "content": "post", "defsite": "text.2"}]

for_data = {
    "defs": {
        "list": {
            "data": ["a", "b"]   
        }
    },
    "for": {
        "elem": "${list}"
    },
    "repeat": {
        "text": [
            "${elem}",
            {
            "def": "context",
            "data": "${pdl_context}",
            "contribute": []
            }

        ]
    },
    "join": {
        "as": "independent"
    }

}

def test_for_data():
    result = exec_dict(for_data, output="all")
    assert result["scope"]["context"] == [
       {
           'content': 'b',
           'defsite': 'repeat.1.text.0',
           'role': 'user',
       },
   ]