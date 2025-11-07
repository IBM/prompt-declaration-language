import math
import random
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable, Optional, TypeVar

from typing_extensions import TypeAliasType

from .pdl import InterpreterConfig, Result
from .pdl import exec_program as pdl_exec_program
from .pdl_ast import BlockType, PdlLocationType, Program, ScopeType
from .pdl_distributions import Categorical
from .pdl_utils import Resample

T = TypeVar("T")


def resample(particles: list[Any], scores: list[float]) -> list[Any]:
    n = len(particles)
    d = Categorical(list(zip(particles, scores, [[] for _ in range(n)])))
    return [d.sample() for _ in range(n)]  # resample a new set of particles


ModelStateT = TypeAliasType("ModelStateT", dict[str, Any])


def make_model(
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
) -> Callable[[ModelStateT, float], Result]:
    def model(replay, score):
        assert config is not None
        config["replay"] = replay
        config["score"] = score
        result = pdl_exec_program(prog, config, scope, loc, "all")
        return result

    return model


def infer_importance_sampling(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
    *,
    num_particles: int,
) -> Categorical[T]:
    """Sequential version"""
    config["with_resample"] = False
    dist: list[tuple[T, float, list[BlockType]]] = []
    for _ in range(num_particles):
        result = pdl_exec_program(prog, config, scope, loc, "all")
        dist.append((result["result"], result["score"], [result["trace"]]))
    return Categorical(dist)


def infer_importance_sampling_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
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
    results: list[Result] = []
    new_particles: list[tuple[ModelStateT, float]] = []
    with ThreadPoolExecutor(max_workers) as executor:
        while len(results) < num_particles:
            new_particles = []
            results = []
            future_to_particle = {
                executor.submit(_process_particle, model, state, score): state
                for state, score in particles
            }
            for future in future_to_particle:
                result = future.result()
                match result:
                    case Resample():
                        new_particles.append((result.state, result.score))
                    case _:  # Result()
                        results.append(result)
                        new_particles.append((result["replay"], result["score"]))
            particles = new_particles
    dist = [
        (result["result"], result["score"], [result["trace"]]) for result in results
    ]
    return Categorical(dist)


def _process_particle(
    model: Callable[[ModelStateT, float], Result],
    state: ModelStateT,
    score: float,
) -> Result | Resample:
    """Process a single particle and return (result, state, score)"""
    try:
        result = model(state, score)
        return result
    except Resample as exn:
        return exn


def infer_smc(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
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
            result = _process_particle(model, state, 0.0)
            match result:
                case Resample():
                    states.append(result.state)
                    scores.append(result.score)
                case _:  # Result()
                    results.append(result)
                    states.append(result["replay"])
                    scores.append(result["score"])
        particles = resample(states, scores)
    dist = [
        (result["result"], result["score"], [result["trace"]]) for result in results
    ]
    return Categorical(dist)


def infer_smc_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
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
    results: list[Result] = []
    scores: list[float] = []
    with ThreadPoolExecutor(max_workers) as executor:
        while len(results) < num_particles:
            states = []
            scores = []
            results = []
            future_to_particle = {
                executor.submit(_process_particle, model, state, 0.0): state
                for state in particles
            }
            for future in future_to_particle:
                result = future.result()
                match result:
                    case Resample():
                        states.append(result.state)
                        scores.append(result.score)
                    case _:  # Result()
                        results.append(result)
                        states.append(result["replay"])
                        scores.append(result["score"])
            particles = resample(states, scores)
    dist = [
        (result["result"], result["score"], [result["trace"]]) for result in results
    ]
    return Categorical(dist)


def infer_rejection_sampling(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
    *,
    num_samples: int,
) -> Categorical[T]:
    config["with_resample"] = False
    model = make_model(prog, config, scope, loc)
    max_score = 0

    def gen():
        while True:
            result = model({}, 0.0)
            score = result["score"]
            alpha = math.exp(min(0, score - max_score))
            u = random.random()  # nosec B311
            # [B311:blacklist] Standard pseudo-random generators are not suitable for security/cryptographic purposes.
            # We are not using this random number for cryptography purpose.
            if u <= alpha:
                return result

    samples = []
    for _ in range(num_samples):
        result = gen()
        samples.append((result["result"], 0.0, [result["trace"]]))
    return Categorical(samples)


def infer_rejection_sampling_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
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
            result = model({}, 0.0)
            score = result["score"]
            alpha = math.exp(min(0, score - max_score))
            u = random.random()  # nosec B311
            # [B311:blacklist] Standard pseudo-random generators are not suitable for security/cryptographic purposes.
            # We are not using this random number for cryptography purpose.
            if u <= alpha:
                return result

    samples = []
    with ThreadPoolExecutor(max_workers) as executor:
        future_to_particle = (executor.submit(gen) for _ in range(num_samples))
        for future in future_to_particle:
            result = future.result()
            samples.append((result["result"], 0.0, [result["trace"]]))

    return Categorical(samples)


def infer_majority_voting(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
    *,
    num_particles: int,
) -> Categorical[T]:
    config["ignore_factor"] = True
    return infer_importance_sampling(
        prog, config, scope, loc, num_particles=num_particles
    )


def infer_majority_voting_parallel(  # pylint: disable=too-many-arguments
    prog: Program,
    config: InterpreterConfig,
    scope: Optional[ScopeType | dict[str, Any]],
    loc: Optional[PdlLocationType],
    # output: Literal["result", "all"],
    *,
    num_particles: int,
    max_workers: Optional[int],
) -> Categorical[T]:
    config["ignore_factor"] = True
    return infer_importance_sampling_parallel(
        prog, config, scope, loc, num_particles=num_particles, max_workers=max_workers
    )


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
