
# Grade School Math

This demo measures success with
[Grade School Math](https://github.com/openai/grade-school-math),
an open source AI dataset from 2021.

Before running the example, you must download the dataset:

```bash
curl https://raw.githubusercontent.com/openai/grade-school-math/refs/heads/master/grade_school_math/data/test.jsonl > test.jsonl
```

To run, do `pdl --stream none gsm8.pdl`.

The example version attempts to do the first 50 questions in that example
using `ollama/granite3.2:8b`.  If you are using Ollama, you should first do

```bash
ollama pull granite3.2:8b
```

To get the model.

You may change the model and model host used, and the number of questions tested, by editing the file.
