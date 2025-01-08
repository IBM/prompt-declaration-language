import os
import subprocess  # nosec
import sys
from shutil import which


def exec_docker(*args):
    try:
        docker = which("docker")
        if docker is None:
            print("Error: unable to find the docker command", file=sys.stderr)
            sys.exit(1)

        watsonx_apikey = "WATSONX_APIKEY=" + os.environ["WATSONX_APIKEY"]
        watsonx_url = "WATSONX_URL=" + os.environ["WATSONX_URL"]
        watsonx_project_id = "WATSONX_PROJECT_ID=" + os.environ["WATSONX_PROJECT_ID"]
        replicate_api_token = "REPLICATE_API_TOKEN=" + os.environ["REPLICATE_API_TOKEN"]

        local_dir = os.getcwd() + ":/local"

        subprocess.run(  # nosec B603
            # [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
            # This is safe since the environment variables are the arguments of the options `-e` and `*args` is explicitly given by the user
            [
                docker,
                "run",
                "-v",
                local_dir,
                "-w",
                "/local",
                "-e",
                watsonx_apikey,
                "-e",
                watsonx_url,
                "-e",
                watsonx_project_id,
                "-e",
                replicate_api_token,
                "--rm",
                "-it",
                "quay.io/project_pdl/pdl",
                *args,
            ],
            check=True,
        )
        sys.exit(0)
    except Exception:
        print(
            "An error occurred while running docker.",
            file=sys.stderr,
        )
        sys.exit(1)
