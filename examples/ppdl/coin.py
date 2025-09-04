import pathlib

from mu_ppl import Empirical, MetropolisHastings, infer

from pdl.pdl import exec_file


def coin():
    cwd = pathlib.Path(__file__).parent.resolve()
    p = exec_file(cwd / "coin.pdl")
    return p


with MetropolisHastings(num_samples=10):
    dist1: Empirical[float] = infer(coin)  # type: ignore
    print(dist1.stats())
    # viz(dist1)
