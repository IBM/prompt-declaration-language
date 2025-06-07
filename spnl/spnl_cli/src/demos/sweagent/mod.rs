use crate::args::Args;
use spnl::{Unit, spnl};

pub fn demo(args: Args) -> Result<Unit, Box<dyn ::std::error::Error>> {
    let Args {
        model,
        n,
        temperature,
        max_tokens,
        ..
    } = args;

    Ok(spnl!(g model
             (cross
              (system "Your job is to judge whether proposed edits to resolve bugs are good ones. Respond with a score from 0 (worst) to 100 (best).")

              (print (format "Generating {n} proposed edits"))
              (plus
               (repeat i 1 n
                (g model (cross
                          (system (file "system.txt"))
                          (user (file "user.txt"))
                          (plus
                           (user (file "fewshots/1.txt"))
                           (user (file "fewshots/2.txt"))
                           (user (file "fewshots/3.txt"))
                           (user (file "fewshots/4.txt"))
                           (user (fetch (format "inputs/{i}.txt")))))

                 temperature max_tokens)))

              (print "Now judging the quality of the edits"))
             0.0 0))
}
