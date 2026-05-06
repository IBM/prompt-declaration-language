# Requirements

You need to install the following python packages:
- ppdl
```
pip install 'prompt-declaration-language[all]'
```

- flake8, wikipedia, evalplus
```
pip install flake8 wikipedia evalplus
```

- livecodebench (https://github.com/LiveCodeBench/LiveCodeBench)
```
git clone https://github.com/LiveCodeBench/LiveCodeBench.git
cd LiveCodeBench
pip install .
```

- pytanque (https://llm4rocq.github.io/pytanque/installation.html)

```
# Install dependencies
opam install lwt logs coq-lsp

# Or install one of the dev versions of coq-lsp, e.g., for Coq.8.20
opam install lwt logs coq.8.20.0
opam pin add coq-lsp https://github.com/ejgallego/coq-lsp.git#v8.20

pip install git+https://github.com/llm4rocq/pytanque.git
```

- Rocq package
```
opam repo add rocq-released https://rocq-prover.org/opam/released
opam update
opam install coq-stdlib coq-coquelicot
```

# PPDL Experiments

To run experiments, first obtain datasets (see below), then execute command:

```
python run_benchmark.py -c experiments/<experiment>.yaml
```
