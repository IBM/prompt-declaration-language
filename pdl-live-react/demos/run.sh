#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
UI="$SCRIPTDIR"/.. # top of react UI
TOP="$UI"/.. # top of repo
T="$UI"/src/demos # place to store traces

pdl --trace "$T"/demo1.json "$UI"/demos/demo1.pdl
pdl --trace "$T"/demo2.json "$UI"/demos/demo2.pdl
pdl --trace "$T"/demo3.json "$TOP"/examples/fibonacci/fib.pdl
pdl --trace "$T"/demo4.json "$TOP"/examples/chatbot/chatbot.pdl <<EOF
what is the fastest animal?
no
in europe?
yes
EOF
pdl --trace "$T"/demo5.json "$TOP"/examples/talk/6-code-json.pdl
pdl --trace "$T"/demo6.json "$UI"/demos/error.pdl || true
pdl --trace "$T"/demo7.json "$TOP"/examples/talk/4-function.pdl
# TODO demo8...
pdl --stream none --trace "$T"/demo9.json "$TOP"/examples/gsm8k/gsm8.pdl
