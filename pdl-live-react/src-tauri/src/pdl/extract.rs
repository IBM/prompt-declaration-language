use crate::pdl::ast::PdlBlock;

/// Extract models referenced by the programs
pub fn extract_models(program: &PdlBlock) -> Vec<String> {
    extract_values(program, "model")
}

/// Take a list of Yaml fragments and produce a vector of the string-valued entries of the given field
pub fn extract_values(program: &PdlBlock, field: &str) -> Vec<String> {
    let mut values = vec![];
    extract_values_iter(program, field, &mut values);

    // A single program may specify the same model more than once. Dedup!
    values.sort();
    values.dedup();

    values
}

/// Take one Yaml fragment and produce a vector of the string-valued entries of the given field
fn extract_values_iter(program: &PdlBlock, field: &str, values: &mut Vec<String>) {
    match program {
        PdlBlock::Model(b) => values.push(b.model.clone()),
        PdlBlock::Repeat(b) => {
            extract_values_iter(&b.repeat, field, values);
        }
        PdlBlock::Message(b) => {
            extract_values_iter(&b.content, field, values);
        }
        PdlBlock::Array(b) => b
            .array
            .iter()
            .for_each(|p| extract_values_iter(p, field, values)),
        PdlBlock::Text(b) => {
            b.text
                .iter()
                .for_each(|p| extract_values_iter(p, field, values));
            if let Some(defs) = &b.defs {
                defs.values()
                    .for_each(|p| extract_values_iter(p, field, values));
            }
        }
        PdlBlock::LastOf(b) => {
            b.last_of
                .iter()
                .for_each(|p| extract_values_iter(p, field, values));
            if let Some(defs) = &b.defs {
                defs.values()
                    .for_each(|p| extract_values_iter(p, field, values));
            }
        }
        PdlBlock::If(b) => {
            extract_values_iter(&b.then, field, values);
            if let Some(else_) = &b.else_ {
                extract_values_iter(else_, field, values);
            }
            if let Some(defs) = &b.defs {
                defs.values()
                    .for_each(|p| extract_values_iter(p, field, values));
            }
        }
        PdlBlock::Object(b) => b
            .object
            .values()
            .for_each(|p| extract_values_iter(p, field, values)),

        PdlBlock::Function(b) => {
            extract_values_iter(&b.return_, field, values);
        }

        _ => {}
    }
}
