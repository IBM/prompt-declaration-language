from IPython.core.magic import Magics, cell_magic, magics_class, needs_local_scope
from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring

from .pdl import exec_str


@magics_class
class PDLMagics(Magics):
    @cell_magic
    @magic_arguments()
    @argument(
        "result_name",
        nargs="?",
        default=None,
        help="""Variable where to store the result of the execution of the provided PDL program.""",
    )
    @needs_local_scope
    def pdl(self, line, cell, local_ns):
        line = line.strip()
        args = parse_argstring(self.pdl, line)
        try:
            result = exec_str(cell, scope=local_ns)
        except Exception as err:
            print(err)
            return
        if args.result_name is not None:
            local_ns[args.result_name] = result


def load_ipython_extension(ipython):
    ipython.register_magics(PDLMagics)
