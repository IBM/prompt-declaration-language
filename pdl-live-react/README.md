# PDL Viewer

To get started, make sure you have a recent version of
[NodeJS](https://nodejs.org/en/download) installed. On MacOS,
these can be installed via `brew install node`.

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
npm ci
```

To start the watcher:
```shell
npm start
```

Which will open up a local port which you can view in your favorite
browser. Edits to any source files will result in quick and automatic
updates to that running UI.

## Tests

There are currently only simple tests for: linting, formatting, and
type checking. These can be run via:
```shell
npm test
```

## Production

This will generate production bundles in `dist/`
```shell
npm run build
```
