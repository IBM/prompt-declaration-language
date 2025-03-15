use yaml_rust2::Yaml;

use crate::interpreter::shasum;

/// Extract models referenced by the program
pub fn extract_models(program: &Yaml) -> (Vec<String>, Yaml) {
    extract_values(program, "model", &|y| y.clone())
}

/// Extract requirements.txt referenced by the program
pub fn extract_requirements(program: &Yaml) -> (Vec<String>, Yaml) {
    let requirements = Yaml::String("requirements".to_string());
    let code = Yaml::String("code".to_string());
    let lang = Yaml::String("lang".to_string());
    let python = Yaml::String("python".to_string());

    extract_values(program, "requirements", &|y| match y {
        Yaml::Hash(h) => {
            match h.contains_key(&requirements) && h.contains_key(&code) && h[&lang] == python {
                true => {
                    let requirements_text = match &h[&requirements] {
                        Yaml::Array(a) => a
                            .into_iter()
                            .map(|item| match item {
                                Yaml::String(s) => s.to_string(),
                                _ => "".to_string(),
                            })
                            .collect::<Vec<_>>()
                            .join("\n"),

                        Yaml::String(s) => s.to_string(),

                        _ => "".to_string(),
                    };

                    let req_hash = shasum::sha256sum_str(requirements_text.as_str()).unwrap();
                    let code_text = if let Some(c) = h[&code].as_str() {
                        format!("{}\nprint(result)", c)
                    } else {
                        "".to_string()
                    };
                    //let code_hash = shasum::sha256sum_str(&code_text.as_str()).unwrap();

                    /*let tmp = Builder::new()
                        .prefix(&format!("pdl-program-{}", code_hash))
                        .suffix(".pdl")
                        .tempfile()
                        .unwrap(); // TODO tmpfile_in(source dir)
                    write(&tmp, code_text).unwrap();
                    let (_, tmp_path) = tmp.keep().unwrap();*/

                    h.remove(&requirements);
                    h[&lang] = Yaml::String("command".to_string());
                    //h.insert(&Yaml::String("file".to_string()), Yaml::Boolean(true));
                    h[&code] = Yaml::Array(vec![
                        Yaml::String(format!(
                            "/Users/nickm/Library/Caches/pdl/venvs/{}/{}/python",
                            req_hash,
                            if cfg!(windows) { "Scripts" } else { "bin" },
                        )),
                        Yaml::String("-c".to_owned()),
                        Yaml::String(code_text),
                    ]);

                    Yaml::Hash(h.clone())
                }
                false => Yaml::Hash(h.clone()),
            }
        }
        y => y.clone(),
    })
}

/// Take a list of Yaml fragments and produce a vector of the string-valued entries of the given field
pub fn extract_values(
    program: &Yaml,
    field: &str,
    mutator: &impl Fn(&mut Yaml) -> Yaml,
) -> (Vec<String>, Yaml) {
    let (mut values, updated_program) = traverse(program, field, mutator);

    // A single program may specify the same model more than once. Dedup!
    values.sort();
    values.dedup();

    (values, updated_program)
}

/// Take one Yaml fragment and produce a vector of the string-valued entries of the given field
fn traverse(
    program: &Yaml,
    field: &str,
    mutator: &impl Fn(&mut Yaml) -> Yaml,
) -> (Vec<String>, Yaml) {
    let mut values: Vec<String> = Vec::new();

    let updated_program: Yaml = match program {
        Yaml::Hash(h) => {
            let mut hh = h.clone();
            for (key, val) in h {
                match key {
                    Yaml::String(f) if f == field => match &val {
                        Yaml::String(m) => {
                            values.push(m.to_string());
                        }
                        Yaml::Array(a) => values.push(
                            a.into_iter()
                                .map(|item| match item {
                                    Yaml::String(s) => s.to_string(),
                                    _ => "".to_string(),
                                })
                                .collect::<Vec<_>>()
                                .join("\n"),
                        ),
                        _ => {}
                    },
                    _ => {}
                }

                let (v, p) = traverse(val, field, mutator);
                hh[key] = p;
                for m in v {
                    values.push(m)
                }
            }

            mutator(&mut Yaml::Hash(hh))
        }

        Yaml::Array(a) => {
            let mut aa = a.clone();
            for (i, val) in a.iter().enumerate() {
                let (v, p) = traverse(val, field, mutator);
                aa[i] = p;
                for m in v {
                    values.push(m);
                }
            }

            mutator(&mut Yaml::Array(aa))
        }

        x => mutator(&mut x.clone()),
    };

    (values, updated_program)
}
