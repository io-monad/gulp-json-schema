import fs from "fs";
import { log, colors, PluginError } from "gulp-util";
import through from "through2";
import tv4 from "tv4";
import SchemaValidator from "./schema-validator";
import ValidationReporter from "./validation-reporter";

const PLUGIN_NAME = "gulp-json-schema";

export default function gulpJsonSchema(schema, options) {
  if (typeof options === "undefined" && typeof schema === "object") {
    options = schema;
  } else {
    options = options || {};
    options.schema = schema;
  }
  if (!options.schema) {
    throw new PluginError(PLUGIN_NAME, "Schema is not specified");
  }

  let validator;
  let reporter;

  function eachFile(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME, "Stream file is not supported"));
    }

    if (!validator) {
      validator = new SchemaValidator(options);
      reporter = new ValidationReporter(options);
    }

    validator.validateJSON(file.contents.toString("utf8"))
    .then(result => {
      file.jsonSchemaResult = result;
      reporter.reportFile(file, result);
      callback(null, file);
    })
    .catch(err => {
      callback(new PluginError(PLUGIN_NAME, err.message || err));
    });
  }

  function endStream(callback) {
    if (reporter) {
      try {
        reporter.reportSummary();
        reporter.checkAllPassed();
      } catch (err) {
        return callback(new PluginError(PLUGIN_NAME, err.message || err));
      }
    }
    callback();
  }

  return through.obj(eachFile, endStream);
}
