# Callback example

This example shows a Python program `repair_main.py` that calls a PDL program `repair_prompt.pdl` through the SDK. Then, `repair_prompt.pdl` calls a function `parse_output` defined in `repair_main.py` to obtain more information. Finally, the PDL program returns to Python an output that the Python code prints. In this example, all data is passed back and forth between Python and PDL using JSON. This JSON data is type-checked using `TypedDict` on the Python side and using `spec` on the PDL side.

To run:

```
python repair_main.py
```

Expected output:

```
---- before call to PDL ----
---- during callback from PDL ----
---- after return from PDL ----
{'before': "print('Hello, world!']", 'after': "print('Hello, world!')"}
```