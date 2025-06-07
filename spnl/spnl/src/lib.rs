pub mod run;

// Inspiration: https://github.com/JunSuzukiJapan/macro-lisp
#[macro_export]
macro_rules! spnl {
    // Core: Generate text given $input using $model
    (g $model:tt $input:tt) => ($crate::spnl!(g $model $input 0.0 0));

    // Core: Generate text given $input using $model with temperature $temp
    (g $model:tt $input:tt $temp:tt) => ($crate::spnl!(g $model $input $temp 0));

    // Core: Generate text given $input using $model with temperature $temp and $max_tokens
    (g $model:tt $input:tt $temp:tt $max_tokens:tt) => ($crate::spnl!(g $model $input $temp $max_tokens false));

    (g $model:tt $input:tt $temp:tt $max_tokens:tt $accumulate:tt) => (
        $crate::Unit::Generate((
            $crate::spnl_arg!($model).to_string(),
            Box::new($crate::spnl_arg!($input).into()),
            $crate::spnl_arg!($max_tokens), $crate::spnl_arg!($temp), $crate::spnl_arg!($accumulate),
        ))
    );

    // Core: Generate with accumulation
    (gx $model:tt $input:tt) => ($crate::spnl!(g $model $input 0.0 0 true));

    // Core: Generate with accumulation with temperature $temp
    (gx $model:tt $input:tt $temp:tt) => ($crate::spnl!(g $model $input $temp 0 true));

    // Core: Generate with accumulation with temperature $temp and $max_tokens
    (gx $model:tt $input:tt $temp:tt $max_tokens:tt) => ($create::spnl!(g $model $input $temp $max_tokens true));

    // Core: Dependent/needs-attention
    (cross $( $e:tt )+) => ( $crate::Unit::Cross(vec![$( $crate::spnl_arg!( $e ).into() ),+]) );

    // Core: Independent/no-attention with one or more inputs provided directly as a vector
    (plus $e:tt) => ( $crate::Unit::Plus($crate::spnl_arg!( $e )) );

    // Core: Independent/no-attention with multiple inputs provided inline
    (plus $( $e:tt )+) => ( $crate::Unit::Plus(vec![$( $crate::spnl_arg!( $e ).into() ),+]) );

    // Core: A user message
    (user $e:tt) => ($crate::Unit::User(($crate::spnl_arg!($e).clone().into(),)));

    // Core: A system message
    (system $e:tt) => ($crate::Unit::System(($crate::spnl_arg!($e).into(),)));

    // Data: incorporate a file at compile time
    (file $f:tt) => (include_str!($crate::spnl_arg!($f)));

    // Data: incorporate a file at compile time, preserving file name
    (filen $f:tt) => (($crate::spnl_arg!($f).to_string(), include_str!($crate::spnl_arg!($f)).to_string()));

    // Data: incorporate a file at run time
    (fetch $f:tt) => (match $crate::spnl!(fetchn $f).1 { $crate::Document::Text(a) => a,  $crate::Document::Binary(b) => String::from_utf8(b).expect("string") });

    // Data: incorporate a file at run time, preserving file name
    (fetchn $f:tt) => {{
        let filename = ::std::path::Path::new(file!()).parent().expect("macro to have parent directory").join($crate::spnl_arg!($f));
        (filename.clone().into_os_string().into_string().expect("filename"), $crate::Document::Text(::std::fs::read_to_string(filename).expect("error reading file")))
    }};

    // Data: incorporate a binary file at run time, preserving file name
    (fetchb $f:tt) => {{
        let filename = ::std::path::Path::new(file!()).parent().expect("macro to have parent directory").join($crate::spnl_arg!($f));
        (filename.clone().into_os_string().into_string().expect("filename"), $crate::Document::Binary(::std::fs::read(filename).expect("error reading file")))
    }};

    // Data: peel off the first $n elements of the given serialized
    // json vector of strings (TODO: split this into multiple macros)
    (take $n:tt $s:tt) => (
        serde_json::from_str::<Vec<String>>($crate::spnl_arg!($s))?
            .into_iter()
            .take($crate::spnl_arg!($n).try_into().expect("usize"))
            .collect::<Vec<_>>()
    );

    // Data: prefix every string in $arr with $p
    (prefix $p:tt $arr:tt) => (
        $crate::spnl_arg!($arr)
            .into_iter()
            .enumerate()
            .map(|(idx, s)| ((1 + idx), s)) // (idx % $crate::spnl_arg!($chunk_size)), s))
            .map(|(idx, s)| $crate::spnl!(user (format "{}{idx}: {:?}" $p s)))
            .collect::<Vec<_>>()
    );

    // Data: break up the array $arr into chunks of maximum size
    // $chunk_size characters and send each chunk to the given
    // (lambda) $f.
    (chunk $chunk_size:tt $arr:tt $f:tt) => (
        $crate::spnl_arg!($arr)
            .chunks($crate::spnl_arg!($chunk_size))
            .map(|chunk| chunk.to_vec())
            .map($crate::spnl_arg!($f))
            .collect::<Vec<_>>()
    );

    // Data: incorporate one or more documents
    (with $embedding_model:tt $input:tt $( $doc:tt )+) => (
        $crate::spnl!(
            cross
                (plus $( (__spnl_retrieve $embedding_model $input $doc) )+)
                (user "Please answer this question:")
                $input
        )
    );

    // Internal
    (__spnl_retrieve $embedding_model:tt $input:tt $doc:tt) => (
        vec![$crate::Unit::Retrieve(
            ($crate::spnl_arg!($embedding_model),
             Box::new($crate::spnl_arg!($input)),
             $crate::spnl_arg!( $doc ).into()) )]
    );

    // Sugar: this unfolds to a `(g $model (cross $body))` but with
    // special user and system messages geared at extracting,
    // simplifying, and summarizing the thought process of the output
    // of prior (g) calls.
    (extract $model:tt $n:tt $body:tt) => {{
        let n = $crate::spnl_arg!($n);
        $crate::spnl!(
            g $model (cross
                      (system "Your are an AI that combines prior outputs from other AIs, preferring no markdown or other exposition.")
                      $body
                      (user (format "Extract and simplify these {} final answers" n))))
    }};

    // Sugar: this unfolds to a `(g $model (cross $body))` but with
    // special user and system messages geared at combining the
    // output of prior (g) calls.
    (combine $model:tt $body:tt) => (
        $crate::spnl!(
            g $model (cross
                      (system "Your are an AI that combines prior outputs from other AIs, preferring no markdown or other exposition.")
                      $body
                      (user "Combine and flatten these into one JSON array, preserving order")))
    );

    // Sugar: this unfolds to repeating the given expression $e $n times.
    (repeat $n:tt $e:tt) => (spnl!(repeat i $n $e));

    // Sugar: this unfolds to repeating the given expression $e $n
    // times and makes available an index variable $i ranging from 0
    // to $n-1.
    (repeat $i:ident $n:tt $e:tt) => (spnl!(repeat $i 0 $n $e));

    // Sugar: this unfolds to repeating the given expression $e $n
    // times and makes available an index variable $i ranging from
    // $start to $n-$start-1.
    (repeat $i:ident $start:tt $n:tt $e:tt) => {{
        let mut args: Vec<$crate::Unit> = vec![];
        let start = $crate::spnl_arg!($start);
        let end = $crate::spnl_arg!($n) + start;
        for $i in start..end {
            args.push($crate::spnl_arg!($e).clone());
        }
        args
    }};

    // Utility: Defines an n-ary function that accepts the given $name'd arguments
    (lambda ( $( $name:ident )* )
     $( ( $($e:tt)* ))*
    ) => (| $($name: Vec<Unit>),* |{ $( $crate::spnl!( $($e)* ) );* });

    // Utility: the length of $list
    (length $list:tt) => ($crate::spnl_arg!($list).len());

    // Utility: read as string from stdin
    (ask $message:tt) => ( $crate::Unit::Ask(($crate::spnl_arg!($message).into(),)) );

    // Utility: print a helpful message to the console
    (print $message:tt) => ( $crate::Unit::Print(($crate::spnl_arg!($message).into(),)) );

    // Utility:
    (format $fmt:tt $( $e:tt )*) => ( &format!($fmt, $($crate::spnl_arg!($e)),* ) );

    // execute rust
    //(rust $( $st:stmt )* ) => ( $($st);* );
    // other
    //($e:expr) => ($e.into());
}

#[macro_export]
macro_rules! spnl_arg {
    ( ( $($e:tt)* ) ) => ( $crate::spnl!( $($e)* ) );
    ($e:expr) => ($e);
}

#[derive(Debug, Clone, PartialEq, serde::Deserialize, serde::Serialize)]
pub enum Document {
    Text(String),
    Binary(Vec<u8>),
}

#[derive(Debug, Clone, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Unit {
    /// User prompt
    User((String,)),

    /// System prompt
    System((String,)),

    /// Print a helpful message to the console
    Print((String,)),

    /// Reduce
    Cross(Vec<Unit>),

    /// Map
    Plus(Vec<Unit>),

    /// Helpful for repeating an operation n times in a Plus
    Repeat((usize, Box<Unit>)),

    /// (model, input, max_tokens, temperature, accumulate?)
    #[serde(rename = "g")]
    Generate((String, Box<Unit>, i32, f32, bool)),

    /// Ask with a given message
    Ask((String,)),

    /// (embedding_model, question, docs): Incorporate information relevant to the
    /// question gathered from the given docs
    Retrieve((String, Box<Unit>, (String, Document))),
}
fn truncate(s: &str, max_chars: usize) -> String {
    if s.len() < max_chars {
        return s.to_string();
    }

    match s.char_indices().nth(max_chars) {
        None => s.to_string(),
        Some((idx, _)) => format!("{}…", &s[..idx]),
    }
}
#[cfg(feature = "cli_support")]
impl ptree::TreeItem for Unit {
    type Child = Self;
    fn write_self<W: ::std::io::Write>(
        &self,
        f: &mut W,
        style: &ptree::Style,
    ) -> ::std::io::Result<()> {
        write!(
            f,
            "{}",
            match self {
                Unit::User((s,)) =>
                    style.paint(format!("\x1b[33mUser\x1b[0m {}", truncate(s, 700))),
                Unit::System((s,)) =>
                    style.paint(format!("\x1b[34mSystem\x1b[0m {}", truncate(s, 700))),
                Unit::Plus(_) => style.paint("\x1b[31;1mPlus\x1b[0m".to_string()),
                Unit::Cross(_) => style.paint("\x1b[31;1mCross\x1b[0m".to_string()),
                Unit::Generate((m, _, _, _, accumulate)) => style.paint(format!(
                    "\x1b[31;1mGenerate\x1b[0m \x1b[2m{m}\x1b[0m accumulate?={accumulate}"
                )),
                Unit::Repeat((n, _)) => style.paint(format!("Repeat {n}")),
                Unit::Ask((m,)) => style.paint(format!("Ask {m}")),
                Unit::Print((m,)) => style.paint(format!("Print {}", truncate(m, 700))),
                Unit::Retrieve((_, _, _)) => style.paint("\x1b[34;1mAugment\x1b[0m".to_string()),
            }
        )
    }
    fn children(&self) -> ::std::borrow::Cow<[Self::Child]> {
        ::std::borrow::Cow::from(match self {
            Unit::Ask(_) | Unit::User(_) | Unit::System(_) | Unit::Print(_) => vec![],
            Unit::Plus(v) | Unit::Cross(v) => v.clone(),
            Unit::Repeat((_, v)) => vec![*v.clone()],
            Unit::Generate((_, i, _, _, _)) => vec![*i.clone()],
            Unit::Retrieve((_, body, (filename, _))) => vec![
                *body.clone(),
                Unit::User((format!("<augmentation document: {filename}>"),)),
            ],
        })
    }
}
impl ::std::fmt::Display for Unit {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        match self {
            Unit::Cross(v) | Unit::Plus(v) => write!(
                f,
                "{}",
                v.iter()
                    .map(|u| format!("{}", u))
                    .collect::<Vec<_>>()
                    .join("\n")
            ),
            Unit::System((s,)) | Unit::User((s,)) => write!(f, "{}", s),
            _ => Ok(()),
        }
    }
}
impl From<&str> for Unit {
    fn from(s: &str) -> Self {
        Self::User((s.into(),))
    }
}
impl ::std::str::FromStr for Unit {
    type Err = Box<dyn ::std::error::Error>;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self::User((s.to_string(),)))
    }
}
impl From<&String> for Unit {
    fn from(s: &String) -> Self {
        Self::User((s.clone(),))
    }
}

/// Pretty print a query
pub fn pretty_print(u: &Unit) -> serde_lexpr::Result<()> {
    println!("{}", serde_lexpr::to_string(u)?);
    Ok(())
}

/// Deserialize a SPNL query from a string
pub fn from_str(s: &str) -> serde_lexpr::error::Result<Unit> {
    serde_lexpr::from_str(s)
}

/// Deserialize a SPNL query from a reader
pub fn from_reader(r: impl ::std::io::Read) -> serde_lexpr::error::Result<Unit> {
    serde_lexpr::from_reader(r)
}

/// Deserialize a SPNL query from a file path
pub fn from_file(f: &str) -> serde_lexpr::error::Result<Unit> {
    serde_lexpr::from_reader(::std::fs::File::open(f)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn macro_user() {
        let result = spnl!(user "hello");
        assert_eq!(result, Unit::User(("hello".to_string(),)));
    }
    #[test]
    fn macro_system() {
        let result = spnl!(system "hello");
        assert_eq!(result, Unit::System(("hello".to_string(),)));
    }
    #[test]
    fn macro_ask() {
        let result = spnl!(ask "hello");
        assert_eq!(result, Unit::Ask(("hello".to_string(),)));
    }
    #[test]
    fn macro_plus_1() {
        let result = spnl!(plus (user "hello") (user "world"));
        assert_eq!(
            result,
            Unit::Plus(vec![
                Unit::User(("hello".to_string(),)),
                Unit::User(("world".to_string(),))
            ])
        );
    }
    #[test]
    fn macro_plus_2() {
        let result = spnl!(plus (user "hello") (system "world"));
        assert_eq!(
            result,
            Unit::Plus(vec![
                Unit::User(("hello".to_string(),)),
                Unit::System(("world".to_string(),))
            ])
        );
    }
    #[test]
    fn macro_cross_1() {
        let result = spnl!(cross (user "hello"));
        assert_eq!(
            result,
            Unit::Cross(vec![Unit::User(("hello".to_string(),))])
        );
    }
    #[test]
    fn macro_cross_3() {
        let result =
            spnl!(cross (user "hello") (system "world") (plus (user "sloop") (user "boop")));
        assert_eq!(
            result,
            Unit::Cross(vec![
                Unit::User(("hello".to_string(),)),
                Unit::System(("world".to_string(),)),
                Unit::Plus(vec![
                    Unit::User(("sloop".to_string(),)),
                    Unit::User(("boop".to_string(),))
                ])
            ])
        );
    }
    #[test]
    fn macro_gen() {
        let result = spnl!(g "ollama/granite3.2:2b" (user "hello") 0.0 0);
        assert_eq!(
            result,
            Unit::Generate((
                "ollama/granite3.2:2b".to_string(),
                Box::new(Unit::User(("hello".to_string(),))),
                0,
                0.0,
                false
            ))
        );
    }

    #[test]
    fn serde_user() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(user \"hello\")")?;
        assert_eq!(result, Unit::User(("hello".to_string(),)));
        Ok(())
    }
    #[test]
    fn serde_system() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(system \"hello\")")?;
        assert_eq!(result, Unit::System(("hello".to_string(),)));
        Ok(())
    }
    #[test]
    fn serde_ask() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(ask \"hello\")")?;
        assert_eq!(result, Unit::Ask(("hello".to_string(),)));
        Ok(())
    }
    #[test]
    fn serde_plus_1() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(plus (user \"hello\"))")?;
        assert_eq!(result, Unit::Plus(vec![Unit::User(("hello".to_string(),))]));
        Ok(())
    }
    #[test]
    fn serde_plus_2() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(plus (user \"hello\") (system \"world\"))")?;
        assert_eq!(
            result,
            Unit::Plus(vec![
                Unit::User(("hello".to_string(),)),
                Unit::System(("world".to_string(),))
            ])
        );
        Ok(())
    }
    #[test]
    fn serde_cross_1() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(cross (user \"hello\"))")?;
        assert_eq!(
            result,
            Unit::Cross(vec![Unit::User(("hello".to_string(),))])
        );
        Ok(())
    }
    #[test]
    fn serde_cross_3() -> Result<(), serde_lexpr::error::Error> {
        let result =
            from_str("(cross (user \"hello\") (system \"world\") (plus (user \"sloop\")))")?;
        assert_eq!(
            result,
            Unit::Cross(vec![
                Unit::User(("hello".to_string(),)),
                Unit::System(("world".to_string(),)),
                Unit::Plus(vec![Unit::User(("sloop".to_string(),))])
            ])
        );
        Ok(())
    }
    #[test]
    fn serde_gen() -> Result<(), serde_lexpr::error::Error> {
        let result = from_str("(g \"ollama/granite3.2:2b\" (user \"hello\") 0 0.0 #f)")?;
        assert_eq!(
            result,
            Unit::Generate((
                "ollama/granite3.2:2b".to_string(),
                Box::new(Unit::User(("hello".to_string(),))),
                0,
                0.0,
                false
            ))
        );
        Ok(())
    }
}

// math
/*(+ $x:tt $y:tt) => ($crate::spnl_arg!($x) + $crate::spnl_arg!($y));*/
//(- $x:tt $y:tt) => ($crate::spnl_arg!($x) - $crate::spnl_arg!($y));
/*(* $x:tt $y:tt) => ($crate::spnl_arg!($x) * $crate::spnl_arg!($y));
(/ $x:tt $y:tt) => ($crate::spnl_arg!($x) / $crate::spnl_arg!($y));
(% $x:tt $y:tt) => ($crate::spnl_arg!($x) % $crate::spnl_arg!($y));*/

// bool
//(false) => ($crate::Unit::Bool(false));
//(true) => ($crate::Unit::Bool(true));
//(self $(. $e:tt)* ) => (self $(. $e)* );

// let
/* (let ( $( ($var:ident $e:tt) )* )
    $( ( $($e2:tt)* ) )*
) => ({
    $(let mut $var = $crate::spnl_arg!($e);)*
    $( $crate::spnl!( $($e2)* ) );*
}); */

// dotimes
/*(dotimes ($var:ident $count:tt) $( ( $($e:tt)* ) )* ) => (
    for $var in 0..$crate::spnl_arg!($count) {
        $( $crate::spnl!( $($e)* ) );*
    }
);*/

// if
/*(if ( $($cond:tt)* ) $e1:tt $e2:tt) => (if $crate::spnl!($($cond)*) { $crate::spnl!($e1) }else{ $crate::spnl!($e2) });
(if ( $($cond:tt)* ) $e:tt) => (if $crate::spnl!($($cond)*) { $crate::spnl!($e) });
(if $cond:tt $e1:tt $e2:tt) => (if $cond { $crate::spnl!($e1) }else{ $crate::spnl!($e2) });
(if $cond:tt $e:tt) => (if $cond { $crate::spnl!($e) });*/

// compare
/*(eq $x:tt $y:tt) => ($crate::spnl_arg!($x) == $crate::spnl_arg!($y));
(== $x:tt $y:tt) => ($crate::spnl_arg!($x) == $crate::spnl_arg!($y));
(!= $x:tt $y:tt) => ($crate::spnl_arg!($x) != $crate::spnl_arg!($y));
(< $x:tt $y:tt) => ($crate::spnl_arg!($x) < $crate::spnl_arg!($y));
(> $x:tt $y:tt) => ($crate::spnl_arg!($x) > $crate::spnl_arg!($y));
(<= $x:tt $y:tt) => ($crate::spnl_arg!($x) <= $crate::spnl_arg!($y));
(>= $x:tt $y:tt) => ($crate::spnl_arg!($x) >= $crate::spnl_arg!($y));*/
