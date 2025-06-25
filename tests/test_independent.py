from pdl.pdl import exec_dict
from pdl.pdl_context import SerializeMode

independent_data = {
    "text": [
        "pre",
        {
            "text": [
                "a",
                {"def": "a_post", "data": "${pdl_context}", "contribute": []},
                "b",
                {"def": "b_post", "data": "${pdl_context}", "contribute": []},
            ],
            "context": "independent",
        },
        "post",
        {"def": "post_post", "data": "${pdl_context}", "contribute": []},
    ]
}


def test_independent_data():
    result = exec_dict(independent_data, output="all")
    assert result["scope"]["a_post"].serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "pre", "pdl__defsite": "text.0"}
    ]
    assert result["scope"]["b_post"].serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "pre", "pdl__defsite": "text.0"}
    ]
    assert result["scope"]["post_post"].serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "pre", "pdl__defsite": "text.0"},
        {"role": "user", "content": "a", "pdl__defsite": "text.1.text.0"},
        {"role": "user", "content": "b", "pdl__defsite": "text.1.text.2"},
        {"role": "user", "content": "post", "pdl__defsite": "text.2"},
    ]


for_data = {
    "defs": {"list": {"data": ["a", "b"]}},
    "for": {"elem": "${list}"},
    "repeat": {
        "text": [
            "${elem}",
            {"def": "context", "data": "${pdl_context}", "contribute": []},
        ]
    },
    "context": "independent",
}


def test_for_data():
    result = exec_dict(for_data, output="all")
    assert result["scope"]["context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "b",
            "pdl__defsite": "repeat.1.text.0",
            "role": "user",
        },
    ]


for_dependent_data = {
    "defs": {"list": {"data": ["a", "b"]}},
    "for": {"elem": "${list}"},
    "repeat": {
        "text": [
            "${elem}",
            {"def": "context", "data": "${pdl_context}", "contribute": []},
        ]
    },
    "context": "dependent",
}


def test_for_dependent_data():
    result = exec_dict(for_dependent_data, output="all")
    assert result["scope"]["context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "a",
            "pdl__defsite": "repeat.0.text.0",
            "role": "user",
        },
        {
            "content": "b",
            "pdl__defsite": "repeat.1.text.0",
            "role": "user",
        },
    ]


lastof_independent_data = {
    "lastOf": [
        "a",
        {"def": "a_post", "data": "${pdl_context}", "contribute": []},
        "b",
        {"def": "b_post", "data": "${pdl_context}", "contribute": []},
        "c",
        {"def": "c_post", "data": "${pdl_context}", "contribute": []},
    ],
    "context": "independent",
}


def test_lastof_independent_data():
    result = exec_dict(lastof_independent_data, output="all")
    assert result["scope"]["a_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["b_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["c_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "a",
            "pdl__defsite": "lastOf.0",
            "role": "user",
        },
        {
            "content": "b",
            "pdl__defsite": "lastOf.2",
            "role": "user",
        },
        {
            "content": "c",
            "pdl__defsite": "lastOf.4",
            "role": "user",
        },
    ]


array_independent_data = {
    "array": [
        "a",
        {"def": "a_post", "data": "${pdl_context}", "contribute": []},
        "b",
        {"def": "b_post", "data": "${pdl_context}", "contribute": []},
        "c",
        {"def": "c_post", "data": "${pdl_context}", "contribute": []},
    ],
    "context": "independent",
}


def test_array_independent_data():
    result = exec_dict(array_independent_data, output="all")
    assert result["scope"]["a_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["b_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["c_post"].serialize(SerializeMode.LITELLM) == []
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "a",
            "pdl__defsite": "array.0",
            "role": "user",
        },
        {
            "content": "b",
            "pdl__defsite": "array.2",
            "role": "user",
        },
        {
            "content": "c",
            "pdl__defsite": "array.4",
            "role": "user",
        },
    ]


object_independent_data = {
    "object": {"a": "hello", "b": "${ pdl_context }"},
    "context": "independent",
}


def test_object_independent_data():
    result = exec_dict(object_independent_data)
    print(type(result["b"]))
    assert result["a"] == "hello"
    assert result["b"].serialize(SerializeMode.LITELLM) == []
