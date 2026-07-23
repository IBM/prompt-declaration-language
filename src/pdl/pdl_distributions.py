# Adapted from mu-ppl: https://github.com/gbdrt/mu-ppl/blob/main/mu_ppl/distributions.py

from typing import Any, Generic, TypeVar

import numpy as np
import numpy.random as rand
import seaborn as sns
from scipy.special import logsumexp

T = TypeVar("T")


class Categorical(Generic[T]):
    """
    Categorical distribution, i.e., finite support distribution where values can be of arbitrary type.
    """

    def __init__(self, tuples: list[tuple[T, float, list[Any]]]):
        """
        Args:
            tuples: List of tuples (value, score, metadata), where the score is in log scale.
        """
        self.values, self.logits, self.metadata = zip(*tuples)
        lse = logsumexp(self.logits)
        self.probs = np.exp(self.logits - lse)  # type: ignore

    def shrink(self) -> "Categorical[T]":
        """
        Create an equivalent distribution without duplicated values.
        """
        res: dict[T, tuple[float, list]] = {}
        for v, w, m in zip(self.values, self.probs, self.metadata):
            if v in res:
                w_v, m_v = res[v]
                res[v] = (w_v + w, m_v + m)
            else:
                res[v] = (w, m)
        return Categorical([(v, np.log(w), m) for v, (w, m) in res.items()])

    def sample(self) -> T:
        u = rand.rand()
        i = np.searchsorted(np.cumsum(self.probs), u)
        return self.values[i]

    def sort(self) -> "Categorical[T]":
        d = self.shrink()
        sorted_indices = np.argsort(d.logits)[::-1]
        d.values = [d.values[i] for i in sorted_indices]
        d.logits = np.array(d.logits)[sorted_indices]
        d.probs = np.array(d.probs)[sorted_indices]
        d.metadata = [d.metadata[i] for i in sorted_indices]
        return d

    def prob(self, x: T) -> float:
        dist = self.shrink()
        try:
            i = dist.values.index(x)
            p = dist.probs[i]
        except ValueError:
            p = 0.0
        return p


def viz(dist: Categorical[float], **kwargs):
    """
    Visualize a distribution
    """
    dist = dist.shrink()
    if len(dist.values) < 100:
        sns.barplot(x=dist.values, y=dist.probs, errorbar=None, **kwargs)
    else:
        sns.histplot(
            x=dist.values,
            weights=dist.probs,
            bins=50,
            kde=True,
            stat="probability",
            **kwargs,
        )
