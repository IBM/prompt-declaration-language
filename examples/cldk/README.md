The PDL program `cldk-assistant.pdl` makes use of the [CLDK](https://github.com/IBM/codellm-devkit) toolkit to analyze a Java project and answer user questions about the project.

To install CLDK:
```
pip install git+https://github.com/IBM/codellm-devkit.git
```

For example, download the `commons-cli` Java project as follows:
```
wget https://github.com/apache/commons-cli/archive/refs/tags/rel/commons-cli-1.7.0.zip -O commons-cli-1.7.0.zip && unzip commons-cli-1.7.0.zip
```

To run the CLDK assistant:
```
pdl cldk-assistant.pdl
```

Enter the path to the above Java project when prompted. Then you can make queries such as "what are all the classes?".