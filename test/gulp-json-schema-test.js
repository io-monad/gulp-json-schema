import assert from "assert";
import figures from "figures";
import gulp from "gulp";
import { PluginError } from "gulp-util";
import gulpJsonSchema from "../src/gulp-json-schema";
import runGulp from "./test-utils/run-gulp";

const dataDir = `${__dirname}/fixture/data`;
const schemaDir = `${__dirname}/fixture/schema`;

describe("gulp-json-schema", () => {
  it("validates piped files against schema", () => {
    return runGulp(() => {
      return gulp.src(`${dataDir}/person/*-valid.json`)
        .pipe(gulpJsonSchema(`${schemaDir}/person.json`));
    }).then(({ logs, error }) => {
      assert(error === null);
      assert.deepEqual(logs, [
        "Schema validation passed for 2 file(s) / 2 file(s)",
      ]);
    });
  });

  it("emits error if any validation failed", () => {
    return runGulp(() => {
      return gulp.src(`${dataDir}/person/*.json`)
        .pipe(gulpJsonSchema(`${schemaDir}/person.json`));
    }).then(({ logs, error }) => {
      assert(error instanceof PluginError);
      assert(error.message === "There was schema validation error");
      assert.deepEqual(logs, [
        `${figures.cross} chelcy-invalid.json has 1 validation error(s)`,
        `   ${figures.pointerSmall} Error: Invalid type: string (expected integer)`,
        `     at /age against schema /properties/age/type`,
        `Schema validation failed for 1 file(s) / 3 file(s)`,
      ]);
    });
  });
});
