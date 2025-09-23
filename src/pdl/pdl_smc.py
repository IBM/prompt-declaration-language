from typing import TypeVar, ParamSpec, Callable, Any
from mu_ppl.distributions import Categorical
from mu_ppl import ImportanceSampling
from tqdm import tqdm
from copy import deepcopy


T = TypeVar("T")
P = ParamSpec("P")


class Resample(Exception):
    def __init__(self, state):
        self.state = state


def resample(particles: list[Any], scores: list[float]) -> list[Any]:
    d = Categorical(list(zip(particles, scores)))
    return [
        d.sample() for _ in range(len(particles))
    ]  # resample a new set of particles


class SMC(ImportanceSampling):

    def infer_smc(self, model) -> Categorical[Any]:
        particles = [{} for _ in range(self.num_particles)]  # initialise the particles
        results: list[Any] = []
        scores: list[float] = []
        while len(results) < self.num_particles:
            states = []
            scores = []
            results = []
            for state in particles:
                self.score = 0  # reset the score
                try:
                    result, state = model(state)
                    results.append(result)  # execute all the particles
                    states.append(state)
                except Resample as exn:
                    states.append(exn.state)
                scores.append(self.score)
            particles = resample(states, scores)
        return Categorical(list(zip(results, scores)))
