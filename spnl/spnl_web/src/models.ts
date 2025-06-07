import { prebuiltAppConfig } from "@mlc-ai/web-llm"

const modelFilter =
  /(1k|f32|hermes-2|llama-2|llama-3-|llama-3.1-|phi-1|phi-2|phi-3-|70b|qwen2|v0.4|q0f16|vision|gemma)/i

export default prebuiltAppConfig.model_list
  .filter((m) => !modelFilter.test(m.model_id))
  .map((m) => ({
    label: m.model_id
      .replace(/(_1)?-MLC/, "")
      .replace(/Distill-/, "")
      .replace(/-q4f16/, ""),
    value: m.model_id,
    children: m.model_id,
    isDisabled: false,
    isAriaDisabled: false,
    description: `Context: ${m.overrides?.context_window_size ?? "unknown"}. VRAM: ${m.vram_required_MB}MB`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))
