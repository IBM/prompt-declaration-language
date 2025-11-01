import math
import random
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable, Literal, Optional, TypeVar

from mu_ppl.distributions import Categorical
from typing_extensions import TypeAliasType

from .pdl import InterpreterConfig
from .pdl import exec_program as pdl_exec_program
from .pdl_ast import PdlLocationType, Program, ScopeType
from .pdl_utils import Resample

T = TypeVar("T")


def resample(particles: list[Any], scores: list[float]) -> list[Any]:
    d = Categorical(list(zip(particles, scores)))
    return [
        d.sample() for _ in range(len(particles))
    ]  # resample a new set of particles


ModelStateT = TypeAliasType("ModelStateT", dict[str, Any])


def make_model(
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
) -> Callable[[ModelStateT, float], tuple[Any, ModelStateT, float]]:
    def model(replay, score):
        assert config is not None
        config["replay"] = replay
        config["score"] = score
        result = pdl_exec_program(prog, config, scope, loc, "all")
        state = result["replay"]
        score = result["score"]
        return result["result"], state, score

    return model


def infer_importance_sampling(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_particles: int,
) -> Categorical[T]:
    """Sequential version"""
    config["with_resample"] = False
    model = make_model(prog, config, scope, loc)
    results: list[T] = []
    scores: list[float] = []
    for _ in range(num_particles):
        result, _, score = model({}, 0.0)
        results.append(result)
        scores.append(score)
    return Categorical(list(zip(results, scores)))


# def infer_importance_sampling_parallel(
#     num_particles: int,
#     model: Callable[[ModelStateT], tuple[T, ModelStateT, float]],
#     max_workers: Optional[int],
# ) -> Categorical[T]:
#     """Parallelized version using ThreadPoolExecutor"""
#     results: list[T] = []
#     scores: list[float] = []
#     with ThreadPoolExecutor(max_workers) as executor:
#         future_to_particle = (executor.submit(model, {}) for _ in range(num_particles))
#         for future in future_to_particle:
#             result, _, score = future.result()
#             results.append(result)
#             scores.append(score)
#     return Categorical(list(zip(results, scores)))


def infer_importance_sampling_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_particles: int,
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""
    config["with_resample"] = True
    model = make_model(prog, config, scope, loc)
    particles: list[tuple[ModelStateT, float]] = [
        ({}, 0.0) for _ in range(num_particles)
    ]  # initialise the particles
    results: list[T] = []
    new_particles: list[tuple[ModelStateT, float]] = []
    while len(results) < num_particles:
        new_particles = []
        results = []
        with ThreadPoolExecutor(max_workers) as executor:
            future_to_particle = {
                executor.submit(_process_particle, model, state, score): state
                for state, score in particles
            }
            for future in future_to_particle:
                result, new_state, new_score = future.result()
                if result is not None:
                    results.append(result)  # execute all the particles
                new_particles.append((new_state, new_score))
        particles = new_particles
    scores = [score for _, score in new_particles]
    return Categorical(list(zip(results, scores)))


def _process_particle(
    model: Callable[[ModelStateT, float], tuple[T, ModelStateT, float]],
    state: ModelStateT,
    score: float,
) -> tuple[Optional[T], ModelStateT, float]:
    """Process a single particle and return (result, state, score)"""
    try:
        result, new_state, new_score = model(state, score)
        return result, new_state, new_score
    except Resample as exn:
        return None, exn.state, exn.score


def infer_smc(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_particles: int,
) -> Categorical[T]:
    """Sequential version"""
    config["with_resample"] = True
    model = make_model(prog, config, scope, loc)
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
            result, state, score = _process_particle(model, state, 0.0)
            if result is not None:
                results.append(result)
            states.append(state)
            scores.append(score)
        particles = resample(states, scores)
    return Categorical(list(zip(results, scores)))


def infer_smc_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_particles: int,
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""
    config["with_resample"] = True
    model = make_model(prog, config, scope, loc)
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
                executor.submit(_process_particle, model, state, 0.0): state
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


def infer_rejection(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_samples: int,
) -> Categorical[T]:
    config["with_resample"] = False
    model = make_model(prog, config, scope, loc)
    max_score = 0

    def gen():
        while True:
            result, _, score = model({}, 0.0)
            alpha = math.exp(min(0, score - max_score))
            u = random.random()  # nosec B311
            # [B311:blacklist] Standard pseudo-random generators are not suitable for security/cryptographic purposes.
            # We are not using this random number for cryptography purpose.
            if u <= alpha:
                return result

    samples = [(gen(), 0.0) for _ in range(num_samples)]
    return Categorical(samples)


def infer_rejection_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    output: Literal["result", "all"],
    *,
    num_samples: int,
    max_workers: Optional[int],
) -> Categorical[T]:
    """Parallelized version using ThreadPoolExecutor"""
    config["with_resample"] = False
    model = make_model(prog, config, scope, loc)
    max_score = 0

    def gen():
        while True:
            result, _, score = model({}, 0.0)
            alpha = math.exp(min(0, score - max_score))
            u = random.random()  # nosec B311
            # [B311:blacklist] Standard pseudo-random generators are not suitable for security/cryptographic purposes.
            # We are not using this random number for cryptography purpose.
            if u <= alpha:
                return result

    results: list[tuple[T, float]] = []
    with ThreadPoolExecutor(max_workers) as executor:
        future_to_particle = (executor.submit(gen) for _ in range(num_samples))
        for future in future_to_particle:
            result = future.result()
            results.append((result, 0.0))
    return Categorical(results)


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
