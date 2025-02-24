# Prompt Declaration Language - Viewer

To get started, make sure you have a recent version of
[NodeJS](https://nodejs.org/en/download) installed and
[Rust](https://www.rust-lang.org/tools/install).

## Implementation Details

The PDL Viewer uses [Tauri](https://v2.tauri.app/) to help with
building production platform applications. Under the covers, Tauri uses
[Vite](https://vite.dev/) for bundling.

The code leverages [React](https://react.dev/) for the UI,
[PatternFly](https://www.patternfly.org/) for UI components, and is
written in [TypeScript](https://www.typescriptlang.org/). The React
components are written in [TSX](https://react.dev/learn/typescript)
(the Typescript variant of JSX).

## Development

To install dependencies:
```shell
npm ci
```

To start the watcher:
```shell
npm start
```

Which will open a new window. Edits to any source files will result in
quick and automatic updates to that running UI.

## Tests

There are currently only simple tests for: linting, formatting, and
type checking. These can be run via:
```shell
npm test
```

## Production

This will generate production web app bundles in `dist/`, and a production platform application.
```shell
npm run build
```

### Production Platform Application Builds

To build production double-clickable applications:
```shell
npm run prod:mac
```

If you run with the
The built applications will be found under `src-tauri/target/release/bundle`.

#### Signing and Notarization on MacOS

If you run `npm run prod:mac` with the following environment variables, you will get a signed and notarized application bundle:
- APPLE_ID=<your apple developer account email address>
- APPLE_PASSWORD=<your app-specific password>
- APPLE_TEAM_ID=<your apple team id>
- APPLE_SIGNING_<also your apple team id>

