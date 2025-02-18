cask "pdl" do
  version "0.3.0"

  name "pdl"
  desc "PDL is a declarative language designed for developers to create reliable, composable LLM prompts and integrate them into software systems."
  homepage "https://github.com/IBM/prompt-declaration-language"

  url "https://github.com/IBM/prompt-declaration-language/releases/download/v#{version}/PDL_#{version}_universal.dmg"
  sha256 "35dcb304ea7355e4daa8330eab0500a1b754ffb6c7ac747a19f8783422dd6f1f"
  app "PDL.app"

  # auto_updates true
  binary "#{appdir}/PDL.app/Contents/MacOS/PDL", target: "pdlv"

  zap trash: "~/Library/Application\ Support/PDL"
end
