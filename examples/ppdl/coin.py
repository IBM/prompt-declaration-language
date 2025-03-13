import pathlib
from mu_ppl import *
from pdl.pdl import exec_file

def coin(obs: list[int]):
    cwd = pathlib.Path(__file__).parent.resolve()
    p, data = exec_file(cwd / "coin.pdl")
    assume(data == obs)
    return p

with RejectionSampling(num_samples=100):
    dist1: Empirical[float] = infer(coin, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1])  # type: ignore
    print(dist1.stats())
    # viz(dist1)
    # plt.show()
    