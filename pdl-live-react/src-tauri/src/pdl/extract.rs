use crate::pdl::ast::{
    Block, Body::*, EvalsTo, Expr, Metadata, ModelBlock, PdlBlock, PdlBlock::Advanced,
};

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
        PdlBlock::Empty(b) => {
            b.defs
                .values()
                .for_each(|p| extract_values_iter(p, field, values));
        }
        PdlBlock::Function(b) => {
            extract_values_iter(&b.return_, field, values);
        }
        Advanced(Block {
            body:
                Model(ModelBlock {
                    model: EvalsTo::<String, String>::Const(m),
                    ..
                }),
            ..
        }) => values.push(m.clone()),
        Advanced(Block {
            body:
                Model(ModelBlock {
                    model: EvalsTo::<String, String>::Jinja(m),
                    ..
                }),
            ..
        }) => values.push(m.clone()),
        Advanced(Block {
            body:
                Model(ModelBlock {
                    model: EvalsTo::<String, String>::Expr(Expr { pdl_expr: m, .. }),
                    ..
                }),
            ..
        }) => values.push(m.clone()),
        Advanced(Block {
            body: Repeat(b), ..
        }) => {
            extract_values_iter(&b.repeat, field, values);
        }
        Advanced(Block {
            body: Message(b), ..
        }) => {
            extract_values_iter(&b.content, field, values);
        }
        Advanced(Block { body: Array(b), .. }) => b
            .array
            .iter()
            .for_each(|p| extract_values_iter(p, field, values)),
        Advanced(Block { body: Text(b), .. }) => {
            b.text
                .iter()
                .for_each(|p| extract_values_iter(p, field, values));
        }
        Advanced(Block {
            body: LastOf(b), ..
        }) => {
            b.last_of
                .iter()
                .for_each(|p| extract_values_iter(p, field, values));
        }
        Advanced(Block { body: If(b), .. }) => {
            extract_values_iter(&b.then, field, values);
            if let Some(else_) = &b.else_ {
                extract_values_iter(else_, field, values);
            }
        }
        Advanced(Block {
            body: Object(b), ..
        }) => b
            .object
            .values()
            .for_each(|p| extract_values_iter(p, field, values)),

        _ => {}
    }

    if let Advanced(Block {
        metadata: Some(Metadata {
            defs: Some(defs), ..
        }),
        ..
    }) = program
    {
        defs.values()
            .for_each(|p| extract_values_iter(p, field, values));
    }
}
