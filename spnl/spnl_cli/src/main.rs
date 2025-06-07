use clap::Parser;

use crate::args::Args;
use crate::demos::*;
use spnl::{
    from_str, pretty_print,
    run::{RunParameters, plan::plan, result::SpnlError, run},
};

mod args;
mod demos;

#[tokio::main]
async fn main() -> Result<(), SpnlError> {
    let args = Args::parse();
    let verbose = args.verbose;
    let show_only = args.show_query;

    let rp = RunParameters {
        vecdb_uri: args.vecdb_uri.clone(),
        vecdb_table: args
            .demo
            .clone()
            .map(|d| format!("demo.{:?}", d))
            .unwrap_or(args.file.clone().unwrap_or("default".to_string())),
    };

    let program = plan(&match args.demo {
        Some(Demo::Chat) => chat::demo(args),
        Some(Demo::Email) => email::demo(args),
        Some(Demo::Email2) => email2::demo(args),
        Some(Demo::Email3) => email3::demo(args),
        Some(Demo::SWEAgent) => sweagent::demo(args).expect("sweagent query to be prepared"),
        Some(Demo::GSM8k) => gsm8k::demo(args).expect("gsm8k query to be prepared"),
        Some(Demo::Rag) => rag::demo(args).expect("rag demo to be prepared"),
        None => {
            use std::io::prelude::*;
            let file = ::std::fs::File::open(args.file.clone().unwrap())?;
            let mut buf_reader = ::std::io::BufReader::new(file);
            let mut contents = String::new();
            buf_reader.read_to_string(&mut contents)?;

            let mut tt = tinytemplate::TinyTemplate::new();
            tt.add_template("file", contents.as_str())?;
            let rendered = tt.render("file", &args)?;
            from_str(rendered.as_str())?
        }
    });

    if show_only {
        let _ = pretty_print(&program)?;
        return Ok(());
    } else if verbose {
        ptree::write_tree(&program, ::std::io::stderr())?;
    }

    run(&program, &rp, None).await.map(|res| {
        if res.to_string().len() > 0 {
            println!("{}", res);
        }
        Ok(())
    })?
}
