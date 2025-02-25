import { join } from "path"
import { test, expect } from "@playwright/test"
;[
  { path: "#", title: /Viewer/ },
  { path: "#welcome", title: /Welcome/ },
  { path: "#about", title: /About/ },
  { path: "#upload", title: /Upload/ },
  { path: "#demos/Fibonacci", title: /Fibonacci/ },
].forEach(({ path, title }) =>
  test(`${path} has title ${title}`, async ({ page }) => {
    await page.goto(join("http://localhost:1420", path))

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(title)
  }),
)
