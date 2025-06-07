use rustyline::error::ReadlineError;

use crate::args::Args;
use spnl::{Unit, spnl};

// https://github.ibm.com/AI4BA/agentic-policy
pub fn demo(args: Args) -> Unit {
    let Args {
        model,
        n,
        temperature,
        max_tokens,
        ..
    } = args;

    let mut rl = rustyline::DefaultEditor::new().unwrap();
    if rl.load_history("history.txt").is_err() {
        println!("No previous history.");
    }
    let prompt = match rl.readline("Tell me about yourself: ") {
        Ok(line) => {
            rl.add_history_entry(line.as_str()).unwrap();
            line
        }
        Err(ReadlineError::Interrupted) | Err(ReadlineError::Eof) => ::std::process::exit(0),
        Err(err) => panic!("{}", err),
    };
    rl.append_history("history.txt").unwrap();

    let candidate_emails = spnl!(
        plus
            (repeat n
             (g model (cross
                       (system (file "email3-generate-system-prompt.txt"))
                       (user prompt))

              temperature max_tokens)
            )
    );

    spnl!(g model (cross
                   (print "Evaluating candidate emails")
                   (system (file "email3-evaluate-system-prompt.txt"))
                   (print "Generate candidate emails in parallel")
                   candidate_emails))
}
