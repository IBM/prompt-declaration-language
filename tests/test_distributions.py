import pytest

from pdl.pdl_distributions import Categorical


@pytest.mark.parametrize("value", [[1, 2], {"answer": 42}])
def test_categorical_supports_unhashable_values(value):
    dist = Categorical(
        [
            (value, 0.0, ["first"]),
            (value.copy(), 0.0, ["second"]),
            (None, 0.0, ["third"]),
        ]
    )

    shrunk = dist.shrink()
    assert shrunk.values == (value, None)
    assert shrunk.probs == pytest.approx([2 / 3, 1 / 3])
    assert shrunk.metadata == (["first", "second"], ["third"])

    sorted_dist = dist.sort()
    assert sorted_dist.values == [value, None]
    assert sorted_dist.probs == pytest.approx([2 / 3, 1 / 3])
    assert sorted_dist.metadata == [["first", "second"], ["third"]]

    assert dist.prob(value.copy()) == pytest.approx(2 / 3)
