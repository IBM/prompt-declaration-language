use yaml_rust2::Yaml;

/// Extract models referenced by the programs
pub fn extract_models(programs: Vec<Yaml>) -> Vec<String> {
    extract_values(programs, "model")
}

/// Take a list of Yaml fragments and produce a vector of the string-valued entries of the given field
pub fn extract_values(programs: Vec<Yaml>, field: &str) -> Vec<String> {
    let mut values = programs
        .into_iter()
        .flat_map(|p| extract_one_values(p, field))
        .collect::<Vec<String>>();

    // A single program may specify the same model more than once. Dedup!
    values.sort();
    values.dedup();

    values
}

/// Take one Yaml fragment and produce a vector of the string-valued entries of the given field
fn extract_one_values(program: Yaml, field: &str) -> Vec<String> {
    let mut values: Vec<String> = Vec::new();

    match program {
        Yaml::Hash(h) => {
            for (key, val) in h {
                match key {
                    Yaml::String(f) if f == field => match &val {
                        Yaml::String(m) => {
                            values.push(m.to_string());
                        }
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
