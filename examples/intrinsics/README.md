This example is an adaptaion of this notebook: https://github.com/ibm-granite-community/granite-snack-cookbook/blob/main/recipes/Intrinsics/Granite_RAG_LoRA.ipynb which will build a new model. In particular, `granite3.0-rag` will be constructed from `granite3.0:8b` and a LoRA adapter which will enahance the base model with RAG capabiltiies. The steps to build the model are embedded into the PDL program.

To run, use `pdl examples/intrinsics/demo-hallucination.pdl`.  The output should be

```
Did Faith Hill take a break from recording after releasing her second album, It Matters to Me?

The answer is: Yes, Faith Hill took a three-year break from recording after releasing her second album, It Matters to Me.
I am not hallucinating, promise!
The citation is: After the release of It Matters to Me,
Hill took a three-year break from recording to give herself a rest from four years of touring
and to begin a family with McGraw. During her break, she joined forces with her husband
for their first duet, "It's Your Love". The song stayed at number one for six weeks,
and won awards from both the Academy of Country Music and the Country Music Association. Hill has remarked that sometimes when they perform the song together,
"it [doesn't] feel like anybody else was really watching."
```

To demonstrate a failure, edit _demo-hallucination.pdl_ replace the query with "Is the Academy of Country Music in Brooklyn, New York?" or "Where was Faith Hill born?".  Re-run `pdl examples/intrinsics/demo-hallucination.pdl`.  The output now is

```
Is the Academy of Country Music in Brooklyn, New York?

The answer is: Sorry, I don't have enough information to answer that question.
Totally hallucinating, sorry!
No citation matched the user query.
```
