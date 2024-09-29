from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("pdl")
except PackageNotFoundError:
    pass
