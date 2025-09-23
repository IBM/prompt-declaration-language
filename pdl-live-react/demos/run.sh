#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
UI="$SCRIPTDIR"/.. # top of react UI
TOP="$UI"/.. # top of repo
T="$UI"/src/demos # place to store traces

pdl --stream none --trace "$T"/demo1.json "$UI"/demos/demo1.pdl
pdl --stream none --trace "$T"/demo2.json "$UI"/demos/demo2.pdl
pdl --stream none --trace "$T"/demo3.json "$TOP"/examples/fibonacci/fib.pdl
pdl --stream none --trace "$T"/demo4.json "$TOP"/examples/chatbot/chatbot.pdl <<EOF
what is the fastest animal?
no
in europe?
yes
EOF
pdl --stream none --trace "$T"/demo5.json "$TOP"/examples/tutorial/programs/code/code-json.pdl
# pdl --trace "$T"/demo6.json "$UI"/demos/error.pdl || true
pdl --stream none --trace "$T"/demo7.json "$TOP"/examples/tutorial/function_definition.pdl
# TODO demo8...
pdl --stream none --trace "$T"/demo9.json "$TOP"/examples/gsm8k/gsm8.pdl
