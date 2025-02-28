#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
UI="$SCRIPTDIR"/.. # top of react UI
TOP="$UI"/.. # top of repo
T="$UI"/src/demos # place to store traces

pdl --trace "$T"/demo1.json "$UI"/demos/demo1.pdl
pdl --trace "$T"/demo2.json "$UI"/demos/demo2.pdl
pdl --trace "$T"/demo3.json <(cat "$TOP"/examples/fibonacci/fib.pdl | sed -E 's#(model: )(.+)#\1ollama/llama3.1:8b#g')
pdl --trace "$T"/demo4.json <(cat "$TOP"/examples/chatbot/chatbot.pdl  | sed -E 's#(model: )(.+)#\1ollama/llama3.1:8b#g') <<EOF
what is the fastest animal?
no
in europe?
yes
EOF
cat "$TOP"/examples/talk/6-code-json.pdl | sed -E 's#(model: )(.+)#\1ollama/llama3.1:8b#g' > "$TOP"/examples/talk/6-code-json.pdl.tmp \
    && pdl --trace "$T"/demo5.json "$TOP"/examples/talk/6-code-json.pdl.tmp \
    && rm "$TOP"/examples/talk/6-code-json.pdl.tmp
pdl --trace "$T"/demo6.json "$UI"/demos/error.pdl || true
pdl --trace "$T"/demo7.json <(cat "$TOP"/examples/talk/4-function.pdl | sed -E 's#(model: )(.+)#\1ollama/llama3.1:8b#g')
