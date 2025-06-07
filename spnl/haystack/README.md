# The Haystack Game

Can the model find the needles in a haystack? We challenge models by
presenting them a sequence with `N` needles surrounded by `H`
characters of lorem-ipsum "hay". We measure precision and recall of
the generated results for a range of `H` values, for various
models. Each measurement is run against a different set of random
lorem-ipsum hay.

- Each needles is: "I am a cat, and my name is (some auto-generated
  name)"
- The hay is random lorem-ipsum noise with a given maximum number of
  characters.
- The **prompt** is: "Tell me the names of the cats mentioned, as
  plain JSON array of the names, no markdown or html or any other
  text"
  
## The span queries

Each span query consists of a number of haystacks "{needle} {hay}"
followed by the prompt requesting the mentioned cat names:

```lisp
(g (x (plus haystack1 haystack2 haystack3 ...) prompt))
```

## With a map/reduce optimization

Here, we subdivide the query such that each inner generation `g` is
prompted to extract cat names from at most `k` haystacks. We then
apply an outer generation to reduce each of the inner generations with
a reduction prompt "Combine these arrays into one array".

For `k=2`, each inner generation looks like:

```lisp
(g (x (plus haystack_a haystack_b) prompt))
```

If we designate this inner generation `g_ab`, then the full map/reduce
program becomes:

```lisp
(g (x (plus g_12 g_34 g_56 ...) reduction_prompt))
```
