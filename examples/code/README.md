# Code Explanation Example

The task at hand is to formulate a prompt to explain the following fragment of code:

```
@SuppressWarnings("unchecked")
public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
  Map<String, String> offsetMap;
  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {
    offsetMap = new HashMap<>();
  } else {
    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);
  }
  return offsetMap;
}
```

We have some information about the repository for this code stored in a JSON [file](./data.yaml), such as repository name, path and filename. Using that data, we wish to formulate a prompt as follows:

```
Here is some info about the location of the function in the repo.
repo: streamsets/datacollector
path: stagesupport/src/main/java/com/.../OffsetUtil.java
Function_name: OffsetUtil.deserializeOffsetMap


Explain the following code:

@SuppressWarnings("unchecked")
public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
  Map<String, String> offsetMap;
  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {
    offsetMap = new HashMap<>();
  } else {
    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);
  }
  return offsetMap;
}
```

The PDL program for this example can be found [here](code.pdl). This example also contains a comparison with some ground truth for evaluation and outputs a text similarity metric ([code-eval.pdl](code-eval.pdl)).
The program [code-json.pdl](code-json.pdl) outputs its results in JSON format.