# gulp-json-schema

[![wercker status](https://app.wercker.com/status/c0c9b2e96eadc1474475a40ff1f7aa0a/s/master "wercker status")](https://app.wercker.com/project/bykey/c0c9b2e96eadc1474475a40ff1f7aa0a)

gulp plugin for validating JSON files with [JSON Schema](http://json-schema.org/)

Currently using [tv4](https://github.com/geraintluff/tv4) as a backend for JSON schema validation, which supports [draft v4 specification](https://tools.ietf.org/html/draft-zyp-json-schema-04).

## Install

    npm install --save-dev gulp-json-schema

## Usage

In your gulpfile:

```js
var gulp = require("gulp");
var jsonSchema = require("gulp-json-schema");

gulp.task("validate", () => {
  return gulp.src("data/**/*.json")
    .pipe(jsonSchema("schema.json"));
});
```

And `gulp validate` will validate all JSON files in `data` directory with `schema.json`.

If validation failed, it will emit an error, which means gulp to stop running. If you want to change this behavior, set `emitError` option to `false`.

### Options

Options can be passed as a second argument, or a first argument with `schema` property of a schema file path.

```js
jsonSchema("schema.json", { /* Options */ })
jsonSchema({ schema: "schema.json", /* Options */ })
```

| Key | Description | Default |
| --- | ----------- | ------- |
| `schema` | Schema file path, or schema object | None |
| `schemas` | Schemas to be preloaded for resolving `$ref`<br>This can be an array of schema object<br>`[{ "$id": "..." }, { "$id": "..." }]`<br>or an array of schema file paths<br>`["schema-a.json", "schema-b.json"]`<br>or a mapping Object with URI keys and schema object values<br>`{ "http://...": {}, "http://...": {} }`<br>See [tv4.addSchema](https://github.com/geraintluff/tv4#addschemauri-schema) for details. | `null` |
| `formats` | Custom format validators<br>A mapping Object with format name keys and validator function values.<br>`{ "my-format": function () { ... } }`<br>See [tv4.addFormat](https://github.com/geraintluff/tv4#addformatformat-validationfunction) for details. | `null` |
| `keywords` | Custom keyword validators<br>A mapping Object with keyword keys and validator function values.<br>`{ "my-keyword": function () { ... } }`<br>See [tv4.defineKeyword](https://github.com/geraintluff/tv4#definekeywordkeyword-validationfunction) for details. | `null` |
| `configure` | Function called with a tv4 instance on initialization.<br>You can use this function to customize tv4 settings. | `null` |
| `loadMissingSchemas` | If set to `true`, it will automatically fetch missing schemas (`$ref` that cannot be resolved) from remote server with HTTP request. | `false` |
| `requestOptions` | Options for [request](https://github.com/request/request) for fetching remote schema. | `{}` |
| `checkRecursive` | If set to `true`, tv4 will handle self-referencing objects properly (slows down validation)<br>See [tv4 article about this option](https://github.com/geraintluff/tv4#cyclical-javascript-objects). | `false` |
| `banUnknownProperties` | If set to `true`, any unknown property causes validation to fail.<br>See [tv4 article about this option](https://github.com/geraintluff/tv4#the-banunknownproperties-flag). | `false` |
| `silent` | If set to `true`, it will never output logs to console. | `false` |
| `verbose` | If set to `true`, it will also report valid files. | `false` |
| `missing` | If set to `"error"` (default), missing schema (`$ref` that cannot be resolved) causes validation to fail.<br>If set to `"warn"`, missing schema will be reported as warning, but it won't fail validation.<br>If set to `"ignore"`, missing schema will never be reported. | `"error"` |
| `emitError` | If set to `false`, it doesn't emit an error for failed validation. (gulp will continue to run tasks) | `true` |

## Build

To transpile source files into `lib`

    npm run build

To watch file changes

    npm run build -- --watch

## Testing

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

[The MIT License](LICENSE)
