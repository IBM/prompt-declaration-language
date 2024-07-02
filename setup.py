from setuptools import find_packages, setup

with open("README.md", "r", encoding="utf-8") as fp:
    long_description = fp.read()


install_requires = [
    "pydantic",
    "ibm-generative-ai",
    "ibm-watsonx-ai",
    "requests",
    "python-dotenv",
    "jinja2",
    "PyYAML",
    "jsonschema",
]

dev = ["black", "pre-commit", "pytest"]
examples = ["wikipedia", "textdistance", "faiss-cpu", "datasets", "sympy"]
docs = ["mkdocs", "mkdocstrings[python]", "mkdocs-material", "pymdown-extensions"]

extras_require = {
    "dev": dev,
    "examples": examples,
    "docs": docs,
    "all": dev + examples + docs,
}
setup(
    name="pdl",
    description="Prompt Description Language.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    version="0.0.0",
    url="https://github.ibm.com/ml4code/pdl",
    python_requires=">=3.12",
    packages=find_packages(),
    install_requires=install_requires,
    extras_require=extras_require,
)
