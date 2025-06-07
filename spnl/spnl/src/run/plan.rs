use crate::Unit;

fn expand_repeats(v: &Vec<Unit>) -> Vec<Unit> {
    v.iter()
        .flat_map(|u| match u {
            Unit::Repeat((n, uu)) => ::std::iter::repeat(plan(&*uu.clone()))
                .take(*n)
                .collect::<Vec<_>>(),
            x => vec![plan(x)],
        })
        .collect()
}

pub fn plan(ast: &Unit) -> Unit {
    // this is probably the wrong place for this, but here we expand any Repeats under Plus or Cross
    match ast {
        Unit::Plus(v) => Unit::Plus(expand_repeats(v)),
        Unit::Cross(v) => Unit::Cross(expand_repeats(v)),
        Unit::Generate((m, i, mt, t, accumulate)) => {
            Unit::Generate((m.clone(), Box::new(plan(i)), *mt, *t, *accumulate))
        }
        x => x.clone(),
    }
}
