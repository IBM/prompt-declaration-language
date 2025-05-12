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
    assert result["scope"]["a_post"] == [
        {"role": "user", "content": "pre", "defsite": "text.0"}
    ]
    assert result["scope"]["b_post"] == [
        {"role": "user", "content": "pre", "defsite": "text.0"}
    ]
    assert result["scope"]["post_post"] == [
        {"role": "user", "content": "pre", "defsite": "text.0"},
        {"role": "user", "content": "a", "defsite": "text.1.text.0"},
        {"role": "user", "content": "b", "defsite": "text.1.text.2"},
        {"role": "user", "content": "post", "defsite": "text.2"},
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
    assert result["scope"]["context"] == [
        {
            "content": "b",
            "defsite": "repeat.1.text.0",
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
    assert result["scope"]["context"] == [
        {
            "content": "a",
            "defsite": "repeat.0.text.0",
            "role": "user",
        },
        {
            "content": "b",
            "defsite": "repeat.1.text.0",
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
    assert result["scope"]["a_post"] == []
    assert result["scope"]["b_post"] == []
    assert result["scope"]["c_post"] == []
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "a",
            "defsite": "lastOf.0",
            "role": "user",
        },
        {
            "content": "b",
            "defsite": "lastOf.2",
            "role": "user",
        },
        {
            "content": "c",
            "defsite": "lastOf.4",
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
    assert result["scope"]["a_post"] == []
    assert result["scope"]["b_post"] == []
    assert result["scope"]["c_post"] == []
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "content": "a",
            "defsite": "array.0",
            "role": "user",
        },
        {
            "content": "b",
            "defsite": "array.2",
            "role": "user",
        },
        {
            "content": "c",
            "defsite": "array.4",
            "role": "user",
        },
    ]


object_independent_data = {
    "object": {"a": "hello", "b": "${ pdl_context }"},
    "context": "independent",
}


def test_object_independent_data():
    result = exec_dict(object_independent_data)
    assert result == {"a": "hello", "b": []}
