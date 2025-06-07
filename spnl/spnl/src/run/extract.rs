use crate::Unit;

/// Extract models referenced by the program
pub fn extract_models(program: &Unit) -> Vec<String> {
    extract_values(program, "model")
}

/// Take a list of Yaml fragments and produce a vector of the string-valued entries of the given field
fn extract_values(program: &Unit, field: &str) -> Vec<String> {
    let mut values = vec![];
    extract_values_iter(program, field, &mut values);

    // A single program may specify the same model more than once. Dedup!
    values.sort();
    values.dedup();

    values
}

/// Produce a vector of the string-valued entries of the given field
fn extract_values_iter(program: &Unit, field: &str, values: &mut Vec<String>) {
    match program {
        Unit::Retrieve((model, _, _)) | Unit::Generate((model, _, _, _, _)) => {
            values.push(model.clone());
        }
        Unit::Plus(v) | Unit::Cross(v) => {
            v.iter()
                .for_each(|vv| extract_values_iter(vv, field, values));
        }
        _ => {}
    }
}
