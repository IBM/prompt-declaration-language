#!/usr/bin/env bash

# This script generates another script to run all PDL examples
# Set the name of your pyenv virtualenv for PDL
PDL_VENV=pdl
OUTPUT_FILE=$(pwd)/run_pdl_examples.sh

# Chdir to parent dir
cd "$(dirname "$0")/.."

# `set -e` exits the script on first non-zero exit code,
# comment out if behavior is not desired.
set -e

# PyEnv setup
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
pyenv local "$PDL_VENV"

echo "#!/usr/bin/env bash" > "$OUTPUT_FILE"
echo "cd \"\$(dirname \"\$0\")/..\" || exit" >> "$OUTPUT_FILE"

for example in examples/**/*.pdl; do
  echo "$example"
  printf "\necho \"Running %s\"\n" "$example" >> "$OUTPUT_FILE"
  printf "python -m pdl.pdl \"%s\"\n" "$example" >> "$OUTPUT_FILE"
done

echo "echo \"All examples have been run.\"" >> "$OUTPUT_FILE"