from pdl.pdl_context import (
    DependentContext,
    IndependentContext,
    SerializeMode,
    SingletonContext,
)
from pdl.pdl_lazy import PdlDict

a = SingletonContext(PdlDict({"role": "user", "content": "hello"}))
b = SingletonContext(PdlDict({"role": "user", "content": "bye"}))

c = SingletonContext(PdlDict({"role": "user", "content": "hello1"}))
d = SingletonContext(PdlDict({"role": "user", "content": "bye1"}))

e = SingletonContext(PdlDict({"role": "user", "content": "hello2"}))
f = SingletonContext(PdlDict({"role": "user", "content": "bye2"}))

d1 = DependentContext([a, b])
d2 = DependentContext([c, d])
i = IndependentContext([e, f])

p = DependentContext([d1, d2])
p1 = DependentContext([d1, i])


def test_p():
    assert p.serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "hello"},
        {"role": "user", "content": "bye"},
        {"role": "user", "content": "hello1"},
        {"role": "user", "content": "bye1"},
    ]
    assert p.serialize(SerializeMode.LITELLM) == p.serialize(SerializeMode.GRANITEIO)


def test_p1():
    assert p1.serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "hello"},
        {"role": "user", "content": "bye"},
        {"role": "user", "content": "hello2"},
        {"role": "user", "content": "bye2"},
    ]

    assert p1.serialize(SerializeMode.GRANITEIO) == [
        {"role": "user", "content": "hello"},
        {"role": "user", "content": "bye"},
        {
            "independent": [
                {"role": "user", "content": "hello2"},
                {"role": "user", "content": "bye2"},
            ]
        },
    ]
