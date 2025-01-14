# PDL Viewer

To get started, make sure you have a recent version of
[NodeJS](https://nodejs.org/en/download) installed and
[Yarn](https://classic.yarnpkg.com/lang/en/docs/install). On MacOS,
these can be installed via `brew install node yarn`.

## Implementation Details

The PDL Viewer uses [Vite](https://vite.dev/) for bundling,
[React](https://react.dev/) for the UI,
[PatternFly](https://www.patternfly.org/) for UI components, and is
written in [TypeScript](https://www.typescriptlang.org/). The React
components are written in [TSX](https://react.dev/learn/typescript)
(the Typescript variant of JSX).

## Development

To install dependencies:
```shell
yarn
```

To start the watcher:
```shell
yarn dev
```

Which will open up a local port which you can view in your favorite
browser. Edits to any source files will result in quick and automatic
updates to that running UI.

## Tests

There are currently only simple tests for: linting, formatting, and
type checking. These can be run via:
```shell
yarn test
```

## Production

This will generate production bundles in `dist/`
```shell
yarn build
```
