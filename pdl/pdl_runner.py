import os
import subprocess
import sys

WATSONX_APIKEY = "WATSONX_APIKEY=" + os.environ["WATSONX_APIKEY"]
WATSONX_URL = "WATSONX_URL=" + os.environ["WATSONX_URL"]
WATSONX_PROJECT_ID = "WATSONX_PROJECT_ID=" + os.environ["WATSONX_PROJECT_ID"]
LOCAL_DIR = os.getcwd() + ":/local"


def main():
    subprocess.run(
        [
            "docker",
            "run",
            "-v",
            LOCAL_DIR,
            "-w",
            "/local",
            "-e",
            WATSONX_APIKEY,
            "-e",
            WATSONX_URL,
            "-e",
            WATSONX_PROJECT_ID,
            "--rm",
            "-it",
            "pdl-runner",
            *sys.argv[1:],
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
