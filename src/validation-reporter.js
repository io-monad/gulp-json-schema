import figures from "figures";
import { colors, log } from "gulp-util";

const DEFAULT_OPTIONS = {
  silent: false,
  verbose: false,
  missing: "error",
  emitError: true,
};

export default class ValidationReporter {
  constructor(options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.summary = {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: 0,
      missing: 0,
    };
  }

  reportFile(file, result) {
    this.addResultToSummary(file, result);
    if (this.options.silent) return;

    if (this.isValidResult(result)) {
      if (result.missing.length > 0 && this.options.missing === "warn") {
        this.reportMissingsWarning(file, result.missing.length);
        this.reportMissing(result.missing, true);
      } else {
        this.reportValid(file);
      }
    } else {
      this.reportFailed(file, result.errors.length, result.missing.length);
      if (result.errors.length > 0) {
        this.reportErrors(result.errors);
      }
      if (result.missing.length > 0) {
        this.reportMissing(result.missing, false);
      }
    }
  }

  reportSummary() {
    if (this.options.silent) return;

    if (this.summary.invalid > 0) {
      log(
        colors.red("Schema validation failed"),
        "for",
        colors.red(this.summary.invalid), "file(s)",
        "/",
        colors.magenta(this.summary.total), "file(s)"
      )
    } else if (this.summary.valid > 0) {
      log(
        colors.green("Schema validation passed"),
        "for",
        colors.green(this.summary.valid), "file(s)",
        "/",
        colors.magenta(this.summary.total), "file(s)"
      )
    } else {
      log(
        colors.yellow("No input files for schema validation")
      );
    }
  }

  checkAllPassed() {
    if (!this.options.emitError) return;

    if (this.summary.invalid > 0) {
      throw new Error(`There was schema validation error`);
    }
  }

  addResultToSummary(file, result) {
    this.summary.total++;
    if (this.isValidResult(result)) {
      this.summary.valid++;
    } else {
      this.summary.invalid++;
    }
    if (result.errors) {
      this.summary.errors += result.errors.length;
    }
    if (result.missing) {
      this.summary.missing += result.missing.length;
    }
  }

  isValidResult(result) {
    return result.valid &&
      (this.options.missing !== "error" || result.missing.length === 0);
  }

  reportValid(file) {
    if (!this.options.verbose) return;
    log(
      colors.green(figures.tick),
      colors.cyan(file.relative)
    );
  }

  reportMissingsWarning(file, missingCount) {
    log(
      colors.yellow(figures.warning),
      colors.cyan(file.relative),
      "has",
      colors.yellow(`${missingCount} missing schema(s)`)
    );
  }

  reportFailed(file, errorCount, missingCount) {
    const results = [];
    if (errorCount > 0) {
      results.push(colors.red(`${errorCount} validation error(s)`));
    }
    if (missingCount > 0) {
      results.push(colors.red(`${missingCount} missing schema(s)`));
    }

    log(
      colors.red(figures.cross),
      colors.cyan(file.relative),
      results.length > 0 ? `has ${results.join(" and ")}` : ""
    );
  }

  reportErrors(errors) {
    errors.forEach(err => {
      this.reportError(err);
    });
  }

  reportError(error, indent = "  ") {
    log(
      indent,
      colors.red(`${figures.pointerSmall} Error:`),
      error.message || "No error message provided by tv4"
    );
    log(
      indent,
      colors.gray(
        "  at",
        colors.blue(error.dataPath || "/"),
        "against schema",
        colors.blue(error.schemaPath || "/")
      )
    );
    if (error.subErrors) {
      error.subErrors.forEach(err => {
        this.reportError(err, `${indent}  `);
      });
    }
  }

  reportMissing(missings, warning, indent = "  ") {
    missings.forEach(uri => {
      log(
        indent,
        warning ?
          colors.yellow(`${figures.pointerSmall} Missing:`) :
          colors.red(`${figures.pointerSmall} Missing:`),
        uri
      );
    });
  }
}
