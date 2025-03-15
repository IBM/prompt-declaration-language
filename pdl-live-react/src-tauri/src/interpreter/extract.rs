use yaml_rust2::Yaml;

/// Extract models referenced by the program
pub fn extract_models(program: &Yaml) -> Vec<String> {
    extract_values(program, "model")
}

/// Extract requirements.txt referenced by the program
pub fn extract_requirements(program: &Yaml) -> Vec<String> {
    extract_values(program, "requirements")
}

/// Take a list of Yaml fragments and produce a vector of the string-valued entries of the given field
pub fn extract_values(program: &Yaml, field: &str) -> Vec<String> {
    let mut values = extract_one_values(program, field);

    // A single program may specify the same model more than once. Dedup!
    values.sort();
    values.dedup();

    values
}

/// Take one Yaml fragment and produce a vector of the string-valued entries of the given field
fn extract_one_values(program: &Yaml, field: &str) -> Vec<String> {
    let mut values: Vec<String> = Vec::new();

    match program {
        Yaml::Hash(h) => {
            for (key, val) in h {
                match key {
                    Yaml::String(f) if f == field => match &val {
                        Yaml::String(m) => {
                            values.push(m.to_string());
                        }
                        Yaml::Array(a) => a.into_iter().for_each(|v| match v {
                            Yaml::String(m) => values.push(m.to_string()),
                            _ => {}
                        }),
                        _ => {}
                    },
                    _ => {}
                }

                for m in extract_one_values(val, field) {
                    values.push(m)
                }
            }
        }

        Yaml::Array(a) => {
            for val in a {
                for m in extract_one_values(val, field) {
                    values.push(m)
                }
            }
        }

        _ => {}
    }

    values
}
