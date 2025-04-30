import pytest

import pdl


def test_version():
    # Make sure the __version__ attribute is available.
    assert pdl.__version__ is not None

    # Since pdl is not installed, the version returned will be the dev version.
    # NOTE: For some reason, the version is not the same as the hardcoded version.
    assert pdl.__version__.startswith("0.1.dev")


if __name__ == "__main__":
    pytest.main(["-v", "--tb=short", __file__])
