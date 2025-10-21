from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable, Optional, ParamSpec, TypeVar

from mu_ppl.distributions import Categorical, Empirical
from typing_extensions import TypeAliasType
import math
import random


T = TypeVar("T")
P = ParamSpec("P")


class Resample(Exception):
    def __init__(self, state, score):
        self.state = state
        self.score = score


def resample(particles: list[Any], scores: list[float]) -> list[Any]:
    d = Categorical(list(zip(particles, scores)))
    return [
        d.sample() for _ in range(len(particles))
    ]  # resample a new set of particles


ModelStateT = TypeAliasType("ModelStateT", dict[str, Any])


def infer_importance_sampling(
    num_particles: int, model: Callable[[ModelStateT], tuple[T, ModelStateT, float]]
) -> Categorical[T]:
    """Sequential version"""
    results: list[T] = []
    scores: list[float] = []
    for _ in range(num_particles):
        result, _, score = model({})
        results.append(result)
        scores.append(score)
    return Categorical(list(zip(results, scores)))


def infer_importance_sampling_parallel(
    num_particles: int,
    model: Callable[[ModelStateT], tuple[T, ModelStateT, float]],
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""
    results: list[T] = []
    scores: list[float] = []
    with ThreadPoolExecutor(max_workers) as executor:
        future_to_particle = (executor.submit(model, {}) for _ in range(num_particles))
        for future in future_to_particle:
            result, _, score = future.result()
            results.append(result)
            scores.append(score)
    return Categorical(list(zip(results, scores)))


def _process_particle(
    state, model: Callable[[ModelStateT], tuple[T, ModelStateT, float]]
) -> tuple[Optional[T], ModelStateT, float]:
    """Process a single particle and return (result, state, score)"""
    try:
        result, new_state, score = model(state)
        return result, new_state, score
    except Resample as exn:
        return None, exn.state, exn.score


def infer_smc(
    num_particles: int, model: Callable[[ModelStateT], tuple[T, ModelStateT, float]]
) -> Categorical[T]:
    """Sequential version"""
    particles: list[ModelStateT] = [
        {} for _ in range(num_particles)
    ]  # initialise the particles
    results: list[Any] = []
    scores: list[float] = []
    while len(results) < num_particles:
        states = []
        scores = []
        results = []
        for state in particles:
            result, state, score = _process_particle(state, model)
            if result is not None:
                results.append(result)
            states.append(state)
            scores.append(score)
        particles = resample(states, scores)
    return Categorical(list(zip(results, scores)))


def infer_smc_parallel(
    num_particles: int,
    model: Callable[[ModelStateT], tuple[T, ModelStateT, float]],
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""
    particles: list[ModelStateT] = [
        {} for _ in range(num_particles)
    ]  # initialise the particles
    results: list[T] = []
    scores: list[float] = []
    while len(results) < num_particles:
        states = []
        scores = []
        results = []
        with ThreadPoolExecutor(max_workers) as executor:
            future_to_particle = {
                executor.submit(_process_particle, state, model): state
                for state in particles
            }
            for future in future_to_particle:
                result, state, score = future.result()
                if result is not None:
                    results.append(result)  # execute all the particles
                states.append(state)
                scores.append(score)
        particles = resample(states, scores)
    return Categorical(list(zip(results, scores)))


def infer_importance_sampling(
    num_particles: int, model: Callable[[ModelStateT], tuple[T, ModelStateT, float]]
) -> Categorical[T]:
    """Sequential version"""
    results: list[T] = []
    scores: list[float] = []
    for _ in range(num_particles):
        result, _, score = model({})
        results.append(result)
        scores.append(score)
    return Categorical(list(zip(results, scores)))


def infer_rejection(
    num_samples: int,
    model: Callable[[ModelStateT], tuple[T, ModelStateT, float]],
) -> Empirical[T]:
    max_score = 0

    def gen():
        while True:
            result, _, score = model({})
            alpha = math.exp(min(0, score - max_score))
            u = random.random()
            if u <= alpha:
                return result

    samples = [gen() for _ in range(num_samples)]
    return Empirical(samples)


def infer_rejection_parallel(
    num_samples: int,
    model: Callable[[ModelStateT], tuple[T, ModelStateT, float]],
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""

    max_score = 0

    def gen():
        while True:
            result, _, score = model({})
            alpha = math.exp(min(0, score - max_score))
            u = random.random()
            if u <= alpha:
                return result

    results: list[T] = []
    with ThreadPoolExecutor(max_workers) as executor:
        future_to_particle = (executor.submit(gen) for _ in range(num_samples))
        for future in future_to_particle:
            result = future.result()
            results.append(result)
    return Empirical(results)


# async def _process_particle_async(state, model, num_particles):
#     with ImportanceSampling(num_particles) as sampler:
#         try:
#             loop = asyncio.get_event_loop()
#             result, new_state = await loop.run_in_executor(None, lambda: model(state))
#             return result, new_state, sampler.score
#         except Resample as exn:
#             return None, exn.state, sampler.score


# async def infer_smc_async(num_particles: int, model) -> Categorical[Any]:
#     """Parallelized version using Async"""
#     particles = [{} for _ in range(num_particles)]  # initialise the particles
#     results: list[Any] = []
#     scores: list[float] = []
#     while len(results) < num_particles:
#         states = []
#         scores = []
#         results = []
#         tasks = [
#             _process_particle_async(state, model, num_particles)
#             for state in particles
#         ]
#         particle_results = await asyncio.gather(*tasks)
#         for result, state, score in particle_results:
#             if result is not None:
#                 results.append(result)
#             states.append(state)
#             scores.append(score)
#         particles = resample(states, scores)
#     return Categorical(list(zip(results, scores)))


# def infer_smc_async(num_particles: int, model) -> Categorical[Any]:
#     return asyncio.run(infer_smc_async(num_particles, model))
