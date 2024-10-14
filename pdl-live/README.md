Install the dependencies:
```
npm install
```

Update the type definitions (if needed):
```
npx json2ts ../src/pdl/pdl-schema.json src/pdl_ast.d.ts --unreachableDefinitions
```

Automatically format the code
```
npm run fix
```

Package the code:
```
npm run build
```

Open the UI:
```
open index.html
```