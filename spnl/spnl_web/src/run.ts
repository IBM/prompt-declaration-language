import { match, P } from "ts-pattern"

import { type Unit, isGenerate, type User, type Assistant } from "./Unit"
import { type InitProgress } from "./ProgressUI"

import generate from "./generate"

type Props = {
  defaultModel: string
  emit(s: string): string
  setProgressInit(p: InitProgress): void
  setProgressDownload(n: number): void
  setProgressDoPar(setter: (a: null | InitProgress[]) => InitProgress[]): void
}

function noEmit() {}

export default async function run(
  unit: Unit,
  props: Props,
  inPlusOrCross = -1,
): Promise<Unit> {
  console.log("Execute query", unit, inPlusOrCross)

  return match(unit)
    .with({ user: P._ }, (x) => {
      if (inPlusOrCross < 0) {
        props.emit(`> **User**
${x.user[0]
  .split("\n")
  .map((line) => `> ${line}`)
  .join("\n")}\n\n`)
      }
      return x
    })
    .with({ system: P._ }, (x) => {
      if (inPlusOrCross < 0) {
        props.emit(`> **System**
${x.system[0]
  .split("\n")
  .map((line) => `> ${line}`)
  .join("\n")}\n\n`)
      }
      return x
    })
    .with({ assistant: P._ }, (x) => x)
    .with(
      { g: P.array() },
      async ({ g: [, input, maxTokens, temperature] }) => {
        const evaluatedInput = await run(input, props, inPlusOrCross)

        const updateGenerationProgress =
          inPlusOrCross < 0
            ? null
            : (value: number) =>
                props.setProgressDoPar((A) => {
                  const item = {
                    min: 0,
                    max: maxTokens * 10,
                    value: value + (!A ? 0 : (A[inPlusOrCross]?.value ?? 0)),
                  }
                  return !A
                    ? [item]
                    : [
                        ...A.slice(0, inPlusOrCross),
                        item,
                        ...A.slice(inPlusOrCross + 1),
                      ]
                })

        const res = await generate(
          evaluatedInput,
          props.defaultModel,
          maxTokens,
          temperature,
          inPlusOrCross >= 0 ? noEmit : props.emit,
          props.setProgressInit,
          props.setProgressDownload,
          updateGenerationProgress,
          inPlusOrCross,
        )
        if (inPlusOrCross >= 0) {
          props.setProgressDoPar((A) => {
            const item = { min: 0, max: maxTokens * 10, value: maxTokens * 10 }
            return !A
              ? [item]
              : [
                  ...A.slice(0, inPlusOrCross),
                  item,
                  ...A.slice(inPlusOrCross + 1),
                ]
          })
        }
        return inPlusOrCross >= 0
          ? ({ user: [res] } satisfies User)
          : ({ assistant: [res] } satisfies Assistant)
      },
    )
    .with({ print: P.array(P.string) }, (x) => {
      props.emit("*" + x.print[0] + "*\n\n")
      return x
    })
    .with({ repeat: P.array() }, (x) => {
      /* will be expanded by the planner */
      return x
    })
    .with({ cross: P.array() }, async ({ cross }) => {
      const results = []
      for (const c of cross) {
        results.push(await run(c, props, inPlusOrCross))
      }
      return { cross: results }
    })
    .with({ plus: P.array() }, async ({ plus }) => {
      const gens = plus.filter(isGenerate)
      if (gens.length > 0) {
        props.setProgressDoPar(() => [] as InitProgress[])
      }
      let genIdx = 0
      return {
        plus: await Promise.all(
          plus.map((u) => {
            const idx = isGenerate(u) ? genIdx++ : -1
            return run(u, props, idx)
          }),
        ),
      }
    })
    .exhaustive()
}
