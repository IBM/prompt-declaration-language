from importlib.metadata import PackageNotFoundError, version

from ._version import __version__ as hardcoded_version


def _get_distribution_version(distribution_name: str) -> str:
    """
    This function attempts to retrieve the version of PDL package using
    importlib.metadata.

    When the package is not installed, importlib will raise a PackageNotFoundError.
    In this case, we fallback to the hardcoded version.

    When the package is installed, but the distribution name does not match,
    importlib will return the version of the package that is installed.
    """
    try:
        return version(distribution_name)
    except PackageNotFoundError:
        # This is a fallback for when the package is not recognized by importlib.metadata.
        # This can happen when the package is not installed.
        return (
            hardcoded_version
            if distribution_name == "pdl"
            else _get_distribution_version(
                "pdl"  # This is a fallback to maintain the previous behavior.
            )
        )


__version__ = _get_distribution_version("prompt-declaration-language")
