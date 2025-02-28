import json
from string import Template

from IPython.core.magic import Magics, cell_magic, magics_class, needs_local_scope
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring
from IPython.display import HTML, display_html

from .pdl import InterpreterConfig, exec_str
from .pdl_ast import get_default_model_parameters
from .pdl_dumper import block_to_dict
from .pdl_lazy import PdlDict, PdlList


@magics_class
class PDLMagics(Magics):
    @cell_magic
    @magic_arguments()
    @argument(
        "-r",
        "--reset-context",
        action="store_true",
        default=False,
        help="Reset the background context to the empty list.",
    )
    @argument(
        "--viewer",
        action="store_true",
        default=False,
        help="Show the execution trace in the PDL viewer.",
    )
    @needs_local_scope
    def pdl(self, line, cell, local_ns):
        line = line.strip()
        args = parse_argstring(self.pdl, line)
        if args.reset_context:
            scope = local_ns | {"pdl_context": PdlList([])}
        else:
            # local_ns won't be lazy; make it lazy again
            scope = local_ns | {"pdl_context": PdlList(local_ns.get("pdl_context", []))}

        if "pdl_model_default_parameters" not in scope:
            scope["pdl_model_default_parameters"] = get_default_model_parameters()

        try:
            pdl_output = exec_str(
                cell,
                config=InterpreterConfig(
                    yield_result=True, yield_background=False, batch=0
                ),
                scope=PdlDict(scope),
                output="all",
            )
        except Exception as err:
            # Uncomment to show PDL tracebacks during Jupyter cell execution
            # import traceback
            # print(traceback.format_exc())
            print(err)
            return

        # (Note that this resolves the lazy pdl_context)
        for x, v in pdl_output["scope"].items():
            local_ns[x] = v

        if args.viewer:
            display_html(
                self.pdl_viewer(
                    block_to_dict(pdl_output["trace"], json_compatible=True)
                )
            )

    def pdl_viewer(self, trace):
        trace_str = json.dumps(trace)
        index = Template(
            """
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />

  <!-- Styling -->
  <!-- <link rel="stylesheet" href="css/index.css"> -->
  <style>
    .pdl_block {
      border-radius: 3px;
      margin: 3px;
      padding: 5px;
      margin: 2px;
      vertical-align: middle;
      display: inline-block;
    }

    .pdl_show_result_false {
      color: rgba(0, 0, 0, 0.5);
    }

    .pdl_string {
      background-color: antiquewhite;
    }

    .pdl_empty {
      background-color: rgb(238, 184, 112);
    }

    .pdl_text {
      background-color: rgb(219, 215, 250);
    }

    .pdl_model {
      background-color: rgb(215, 250, 224);
    }

    .pdl_code {
      background-color: rgb(250, 215, 225);
    }

    .pdl_api {
      background-color: rgb(122, 246, 113);
    }

    .pdl_get {
      background-color: rgb(125, 229, 243);
    }

    .pdl_data {
      background-color: rgb(146, 181, 245);
    }

    .pdl_if {
      background-color: rgb(248, 99, 141);
    }

    .pdl_repeat {
      background-color: rgb(251, 201, 86);
    }

    .pdl_read {
      background-color: rgb(243, 77, 113);
    }

    .pdl_include {
      background-color: rgb(245, 18, 67);
    }

    .pdl_import {
      background-color: rgb(245, 18, 67);
    }

    .pdl_function {
      background-color: rgb(77, 243, 132);
    }
    .pdl_call {
      background-color: rgb(80, 243, 77);
    }

  </style>

  <!-- Main script -->
  <script src="https://ibm.github.io/prompt-declaration-language/dist/bundle.js"></script>

  <!-- Multi column layout -->
  <link rel="stylesheet" type="text/css" href="https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.css">


</head>

<body>


  <!-- Main window -->
  <div id="mainview">

    <!-- Main window layout -->
    <div id="layout" style="width: 95%; height: 400px;"></div>
    <script type="module">
      import { w2layout } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

      let pstyle = 'border: 1px solid #efefef; padding: 5px'
      new w2layout({
        box: '#layout',
        name: 'layout',
        panels: [
          { type: 'left', size: 600, resizable: true, style: pstyle, html: '<div id="doc"></div>' },
          { type: 'main', style: pstyle, html: '<div id="code"></div>' }
        ]
      })
      const data = $trace_str
      pdl_viewer.replace_div('doc', pdl_viewer.show_output(data))

    </script>

  </div>

</body>

</html>
"""
        )
        return HTML(index.substitute(trace_str=trace_str))


def load_ipython_extension(ipython):
    ipython.register_magics(PDLMagics)
