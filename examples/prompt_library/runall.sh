#!/usr/bin/env bash

echo "CoT"
# pdl --stream background examples/prompt_library/demos/CoT.pdl

echo "Gsm8k"

# pdl --stream background examples/prompt_library/demos/gsm8k/CoT.pdl
# pdl --stream background examples/prompt_library/demos/gsm8k/ReAct.pdl
# pdl --stream background examples/prompt_library/demos/gsm8k/ReWoo.pdl
# pdl --stream background examples/prompt_library/demos/PoT.pdl
pdl --stream background examples/prompt_library/demos/RAG.pdl
pdl --stream background examples/prompt_library/demos/ReAct.pdl
pdl --stream background examples/prompt_library/demos/ReWOO.pdl
# pdl --stream background examples/prompt_library/demos/simple_CoT_gsm8k.pdl
# pdl --stream background examples/prompt_library/demos/simple_PoT_gsm8k.pdl
# pdl --stream background examples/prompt_library/demos/simple_rag.pdl
# pdl --stream background examples/prompt_library/demos/Verifier_json.pdl
# pdl --stream background examples/prompt_library/demos/Verifier.pdl
# pdl --stream background examples/prompt_library/demos/Wikipedia_ReAct_json.pdl
# pdl --stream background examples/prompt_library/demos/Wikipedia_ReWOO.pdl