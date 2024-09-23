from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version("pdl")
except PackageNotFoundError:
    pass