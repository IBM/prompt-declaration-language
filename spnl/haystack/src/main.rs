use clap::Parser;
use petname::Generator; // Trait needs to be in scope for `iter`.
use spnl::{
    Unit,
    run::{result::SpnlError, run},
    spnl,
};

type GeneratedNames = Vec<String>;
#[derive(serde::Deserialize)]
struct Name {
    name: String,
}
type GeneratedNames2 = Vec<Name>;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
pub struct Args {
    /// Model
    #[arg(short, long, default_value = "ollama/granite3.3:2b")]
    pub model: String,

    /// Temperature
    #[arg(short, long, default_value_t = 0.0)]
    pub temperature: f32,

    /// Approximate length of each inner document
    #[arg(short, long, default_value_t = 100)]
    pub length: usize,

    /// Approximate length of each inner document
    #[arg(short, long, default_value_t = 4)]
    pub num_documents: usize,

    /// Introduce chained dependences
    #[arg(short = 'c', long, default_value_t = false)]
    pub chain: bool,

    /// Divide and conquer
    #[arg(short = 'k', long, default_value_t = 0)]
    pub chunk: usize,

    /// Only emit score
    #[arg(short, long, default_value_t = false)]
    pub quiet: bool,

    /// Only emit the plan
    #[arg(short, long, default_value_t = false)]
    pub dry_run: bool,
}

fn ratio(n: usize, d: usize) -> f64 {
    (n as f64) / (d as f64)
}

fn score(expected: &Vec<String>, actual: &Vec<String>) -> (f64, f64) {
    let true_positives = actual.iter().filter(|s| expected.contains(s)).count();
    let false_positives = actual.iter().filter(|s| !expected.contains(s)).count();
    let false_negatives = expected.iter().filter(|s| !actual.contains(s)).count();
    let precision = ratio(true_positives, true_positives + false_positives);
    let recall = ratio(true_positives, true_positives + false_negatives); // a.k.a. true positive rate
    (if precision.is_nan() { 0.0 } else { precision }, recall)
}

fn score_chain(expected: &Vec<String>, actual: &Vec<String>) -> (f64, f64) {
    let do_not_want = &expected[0];
    let n = expected.len() - 1;
    (
        1.0 - ratio(
            actual[1..]
                .into_iter()
                .filter(|b| *b == do_not_want)
                .count(),
            n,
        ),
        0.0,
    )
}

#[tokio::main]
async fn main() -> Result<(), SpnlError> {
    let Args {
        chain,
        chunk,
        model,
        temperature,
        length,
        num_documents,
        quiet,
        dry_run,
    } = Args::parse();

    let name_generator = petname::Petnames::default();
    let names: Vec<String> = (0..num_documents)
        .filter_map(|_| name_generator.generate_one(2, "-"))
        .collect();
    assert_eq!(names.len(), num_documents);

    // let max_tokens: i32 = names.iter().map(|n| n.len() as i32).sum::<i32>();

    let mut rng = rand::thread_rng();
    let docs: Vec<Unit> = if chain {
        names
            .iter()
            .enumerate()
            .map(|(idx, name)| {
                if idx == 0 {
                    format!(
                        "I am a cat, and my name is {name}. {}",
                        lipsum::lipsum_words_with_rng(&mut rng, length)
                    )
                } else {
                    format!(
                        "I am also a cat, and I have the same name as the previous cat! {}",
                        lipsum::lipsum_words_with_rng(&mut rng, length)
                    )
                }
            })
            .map(|text| spnl!(user text))
            .collect()
    } else {
        names
            .iter()
            .map(|name| {
                format!(
                    "I am a cat, and my name is {name}. {}",
                    lipsum::lipsum_words_with_rng(&mut rng, length)
                )
            })
            .map(|text| spnl!(user text))
            .collect()
    };

    let expected_names = if chain {
        let mut v = ::std::iter::repeat("".to_string())
            .take(num_documents)
            .collect::<Vec<_>>();
        v[0] = names[0].clone();
        v
    } else {
        names
    };

    let system_prompt = r#"Your are an AI that responds to questions with a plain JSON array of strings such as ["a","b","c"] or ["x","y","z","w"] or ["hello","world"], no markdown or html or any other extra text"#;
    let user_prompt = "Tell me the names of the cats mentioned";

    let program: Unit = if chunk > 0 {
        let chunks: Vec<Unit> = docs
            .chunks(chunk)
            .map(|chunk| chunk.to_vec())
            .map(|chunk| {
                spnl!(
                g model
                    (cross (system system_prompt) (plus chunk) (user user_prompt))
                    temperature)
            })
            .collect();

        if chunks.len() == 1 {
            chunks[0].clone()
        } else {
            spnl!(
                g model
                    (cross
                     (system system_prompt)
                     (plus chunks)
                     (user "Combine these arrays into one array")
                    )
                    temperature
            )
        }
    } else {
        spnl!(
            g model
                (cross
                 (system system_prompt)
                 (plus docs)
                 (user user_prompt)
                )
                temperature
        )
    };

    if !quiet {
        let mut stderr = ::std::io::stderr();
        ptree::write_tree(&program, &mut stderr)?;
    }

    if dry_run {
        return Ok(());
    }

    match run(&program, Some(&indicatif::MultiProgress::new())).await? {
        Unit::User((ss,)) => {
            // oof, be gracious here. sometimes the model wraps the
            // requested json array with markdown even though we asked
            // it not to
            let s = if let Some(idx) = ss.find("```json") {
                ss[idx + 7..ss.len() - 3].trim()
            } else {
                ss.trim()
            };

            let generated_names: GeneratedNames = serde_json::from_str::<GeneratedNames>(&s)
                .unwrap_or_else(|_| {
                    let n2: GeneratedNames2 = serde_json::from_str(&s).unwrap_or_else(|_| vec![]);
                    n2.into_iter().map(|n| n.name).collect()
                })
                .into_iter()
                .map(|s| s.to_lowercase())
                .collect();

            /*if generated_names.len() < expected_names.len() {
                for _ in 0..expected_names.len() - generated_names.len() {
                    generated_names.push("".to_string());
                }
            } else if expected_names.len() < generated_names.len() {
                for _ in 0..generated_names.len() - expected_names.len() {
                    expected_names.push("".to_string());
                }
            }*/

            let (precision, recall) = if chain {
                score_chain(&expected_names, &generated_names)
            } else {
                score(&expected_names, &generated_names)
            };

            let messed_up = precision < 1.0 || recall < 1.0;
            if messed_up {
                eprintln!("I messed up!");
            }
            if !quiet || messed_up {
                eprintln!("\tPrecision: {precision}");
                eprintln!("\tRecall: {recall}");
                eprintln!("\tExpected names: {:?}", expected_names);
                eprintln!("\tActual names raw: {:?}", s);
                eprintln!("\tActual names: {:?}", generated_names);
            }

            println!("{model} {temperature} {num_documents} {length} {precision} {recall}");
            Ok(())
        }
        x => Err(Box::from(format!("Unexpected non-string response {:?}", x))),
    }
}
