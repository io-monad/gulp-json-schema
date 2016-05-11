import assert from "assert";
import figures from "figures";
import captureLog from "./test-utils/capture-log";
import ValidationReporter from "../src/validation-reporter";

describe("ValidationReporter", () => {
  const validResult = {
    valid: true,
    errors: [],
    missing: [],
  };
  const failedResult = {
    valid: false,
    errors: [{
      message: "Invalid type: string (expected integer)",
      dataPath: "/age",
      schemaPath: "/properties/age/type",
      subErrors: null,
    }],
    missing: [],
  };
  const missingResult = {
    valid: true,
    errors: [],
    missing: ["http://example.com/schema.json"],
  };
  const nestedFailedResult = {
    valid: false,
    errors: [{
      message: "Data does not match any schemas from \"oneOf\"",
      dataPath: "",
      schemaPath: "/oneOf",
      subErrors: [
        {
          message: "Invalid type: string (expected integer)",
          dataPath: "",
          schemaPath: "/oneOf/0/type",
          subErrors: null,
        },
        {
          message: "String is too short (0 chars), minimum 1",
          dataPath: "",
          schemaPath: "/oneOf/1/minLength",
          subErrors: null,
        },
      ],
    }],
    missing: [],
  };

  describe("#reportFile", () => {
    it("reports nothing for valid result by default", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, validResult);
      }).then(logs => {
        assert.deepEqual(logs, []);
      });
    });

    it("reports valid result with verbose = true", () => {
      const reporter = new ValidationReporter({ verbose: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, validResult);
      }).then(logs => {
        assert.deepEqual(logs, [`${figures.tick} foo.json`]);
      });
    });

    it("reports failed result", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
      }).then(logs => {
        assert.deepEqual(logs, [
          `${figures.cross} foo.json has 1 validation error(s)`,
          `   ${figures.pointerSmall} Error: Invalid type: string (expected integer)`,
          `     at /age against schema /properties/age/type`,
        ]);
      });
    });

    it("reports nested subErrors in failed result", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, nestedFailedResult);
      }).then(logs => {
        assert.deepEqual(logs, [
          `${figures.cross} foo.json has 1 validation error(s)`,
          `   ${figures.pointerSmall} Error: Data does not match any schemas from "oneOf"`,
          `     at / against schema /oneOf`,
          `     ${figures.pointerSmall} Error: Invalid type: string (expected integer)`,
          `       at / against schema /oneOf/0/type`,
          `     ${figures.pointerSmall} Error: String is too short (0 chars), minimum 1`,
          `       at / against schema /oneOf/1/minLength`,
        ]);
      });
    });

    it("does not report failed result with silent = true", () => {
      const reporter = new ValidationReporter({ silent: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
      }).then(logs => {
        assert.deepEqual(logs, []);
      });
    });

    it("reports missing result as failed by default", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(logs => {
        assert.deepEqual(logs, [
          `${figures.cross} foo.json has 1 missing schema(s)`,
          `   ${figures.pointerSmall} Missing: http://example.com/schema.json`,
        ]);
      });
    });

    it("does not report missing result with silent = true", () => {
      const reporter = new ValidationReporter({ silent: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(logs => {
        assert.deepEqual(logs, []);
      });
    });

    it("reports missing result as warning with missing = 'warn'", () => {
      const reporter = new ValidationReporter({ missing: "warn", verbose: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(logs => {
        assert.deepEqual(logs, [
          `${figures.warning} foo.json has 1 missing schema(s)`,
          `   ${figures.pointerSmall} Missing: http://example.com/schema.json`,
        ]);
      });
    });

    it("reports missing result as valid with missing = 'ignore'", () => {
      const reporter = new ValidationReporter({ missing: "ignore", verbose: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(logs => {
        assert.deepEqual(logs, [`${figures.tick} foo.json`]);
      });
    });
  });

  describe("#reportSummary", () => {
    it("reports failed count if any failed", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
        reporter.reportFile({ relative: "bar.json" }, failedResult);
        reporter.reportFile({ relative: "baz.json" }, validResult);
      }).then(() => captureLog(() => {
        reporter.reportSummary();
      })).then(logs => {
        assert.deepEqual(logs, ["Schema validation failed for 2 file(s) / 3 file(s)"]);
      });
    });

    it("reports valid count if all valid", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, validResult);
        reporter.reportFile({ relative: "bar.json" }, validResult);
        reporter.reportFile({ relative: "baz.json" }, validResult);
      }).then(() => captureLog(() => {
        reporter.reportSummary();
      })).then(logs => {
        assert.deepEqual(logs, ["Schema validation passed for 3 file(s) / 3 file(s)"]);
      });
    });

    it("reports nothing with silent = true", () => {
      const reporter = new ValidationReporter({ silent: true });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
        reporter.reportFile({ relative: "bar.json" }, failedResult);
        reporter.reportFile({ relative: "baz.json" }, validResult);
      }).then(() => captureLog(() => {
        reporter.reportSummary();
      })).then(logs => {
        assert.deepEqual(logs, []);
      });
    });

    it("reports warning when no input files", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportSummary();
      }).then(logs => {
        assert.deepEqual(logs, ["No input files for schema validation"]);
      });
    });
  });

  describe("#checkAllPassed", () => {
    it("throws Error when any failed", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
      }).then(() => {
        assert.throws(() => {
          reporter.checkAllPassed();
        }, /There was schema validation error/);
      });
    });

    it("does not throw Error when all passed", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, validResult);
      }).then(() => {
        assert.doesNotThrow(() => {
          reporter.checkAllPassed();
        });
      });
    });

    it("does not throw Error with emitError = false", () => {
      const reporter = new ValidationReporter({ emitError: false });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, failedResult);
      }).then(() => {
        assert.doesNotThrow(() => {
          reporter.checkAllPassed();
        });
      });
    });

    it("throws Error for missing result by default", () => {
      const reporter = new ValidationReporter();
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(() => {
        assert.throws(() => {
          reporter.checkAllPassed();
        }, /There was schema validation error/);
      });
    });

    it("does not throw Error for missing result with missing = 'warn'", () => {
      const reporter = new ValidationReporter({ missing: "warn" });
      return captureLog(() => {
        reporter.reportFile({ relative: "foo.json" }, missingResult);
      }).then(() => {
        assert.doesNotThrow(() => {
          reporter.checkAllPassed();
        });
      });
    });
  });
});
