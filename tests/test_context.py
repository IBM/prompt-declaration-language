from pdl.pdl_context import DependentContext, BaseMessage, IndependentContext, SerializeMode
from pdl.pdl_lazy import PdlList

a = BaseMessage({"role": "user", "content": "hello"})
b = BaseMessage({"role": "user", "content": "bye"})

c = BaseMessage({"role": "user", "content": "hello1"})
d = BaseMessage({"role": "user", "content": "bye1"})

e = BaseMessage({"role": "user", "content": "hello2"})
f = BaseMessage({"role": "user", "content": "bye2"})

d1 = DependentContext(PdlList([a, b]))
d2 = DependentContext(PdlList([c, d]))
i = IndependentContext(PdlList([e, f]))

p = DependentContext(PdlList([d1, d2]))
p1 = DependentContext(PdlList([d1, i]))

def test_p():
    assert p.serialize(SerializeMode.LITELLM) == [{"role": "user", "content": "hello"},
                                                  {"role": "user", "content": "bye"},
                                                  {"role": "user", "content": "hello1"},
                                                  {"role": "user", "content": "bye1"}]
    assert p.serialize(SerializeMode.LITELLM) == p.serialize(SerializeMode.GRANITEIO)


def test_p1():
    assert p1.serialize(SerializeMode.LITELLM) == [{"role": "user", "content": "hello"},
                                                  {"role": "user", "content": "bye"},
                                                  {"role": "user", "content": "hello2"},
                                                  {"role": "user", "content": "bye2"}]
    
    assert p1.serialize(SerializeMode.GRANITEIO) == [{"role": "user", "content": "hello"},
                                                  {"role": "user", "content": "bye"},
                                                  {"independent": [{"role": "user", "content": "hello2"},
                                                  {"role": "user", "content": "bye2"}]}]