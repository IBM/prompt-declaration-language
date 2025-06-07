use crate::args::Args;
use spnl::{Unit, spnl};

pub fn demo(args: Args) -> Unit {
    let Args {
        model,
        n,
        temperature,
        max_tokens,
        ..
    } = args;

    spnl!(g model
          (cross
           (print "Ask the model to select the best option from the candidates")

           (system "You compute an evaluation score from 0 to 100 that ranks given candidate introductory emails. Better emails are ones that mention specifics, such as names of people and companies. You present a list of the top 3 ordered by their rank showing the score and full content of each.")

           (print (format "Generate {n} candidate emails in parallel"))

           (plus
            (repeat n
             (g model (format "write an introductory email for a job application, limited to at most {max_tokens} characters.")
              temperature max_tokens)))

           (user "My name is Shiloh. I am a data scientist with 10 years of experience and need an introductory email to apply for a position at IBM in their research department")))
}
