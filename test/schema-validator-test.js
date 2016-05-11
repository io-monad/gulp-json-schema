import assert from "assert";
import nock from "nock";
import SchemaValidator from "../src/schema-validator";
import personSchema from "./fixture/schema/person.json";
import productSchema from "./fixture/schema/product.json";
import refSchema from "./fixture/schema/ref.json";

describe("SchemaValidator", () => {
  describe("#validateJSON", () => {
    it("validates JSON string", () => {
      const validator = new SchemaValidator({ schema: personSchema });
      return validator.validateJSON('{ "name": "io-monad", "age": 123 }')
        .then(ret => {
          assert(ret.valid === true);
          assert(ret.errors.length === 0);
          assert(ret.missing.length === 0);
        });
    });

    it("rejects Promise if JSON string is invalid", () => {
      const validator = new SchemaValidator({ schema: personSchema });
      return validator.validateJSON('{ broken }')
        .then(() => { throw new Error("should not be resolved") })
        .catch(err => {
          assert(err.name === "SyntaxError");
        });
    });
  });

  describe("#validate", () => {
    it("validates data", () => {
      const validator = new SchemaValidator({ schema: personSchema });
      return validator.validate({ name: "io-monad", age: 123 })
        .then(ret => {
          assert(ret.valid === true);
          assert(ret.errors.length === 0);
          assert(ret.missing.length === 0);
        });
    });

    it("resolves Promise with errors when validation failed", () => {
      const validator = new SchemaValidator({ schema: personSchema });
      return validator.validate({ name: "io-monad", age: "secret" })
        .then(ret => {
          assert(ret.valid === false);
          assert(ret.errors.length === 1);
          assert(ret.missing.length === 0);

          const err = ret.errors[0];
          assert(err.message === "Invalid type: string (expected integer)");
          assert(err.dataPath === "/age");
          assert(err.schemaPath === "/properties/age/type");
        });
    });

    it("does not load missing schema by default", () => {
      const validator = new SchemaValidator({ schema: refSchema });
      return validator.validate({ name: "io-monad", age: 123 })
        .then(ret => {
          assert(ret.valid === true);
          assert(ret.errors.length === 0);
          assert(ret.missing.length === 1);
        });
    });

    it("loads missing schema with loadMissingSchemas = true", () => {
      nock("http://schema-fixture.test")
        .get("/person.json").reply(200, personSchema);

      const validator = new SchemaValidator({
        schema: refSchema,
        loadMissingSchemas: true,
      });
      return validator.validate({ name: "io-monad", age: "secret" })
        .then(ret => {
          assert(ret.valid === false);
          assert(ret.errors.length === 1);
          assert(ret.missing.length === 0);
          assert(ret.errors[0].dataPath === "/age");
        });
    });

    it("uses preloaded schema given by schemas options", () => {
      const validator = new SchemaValidator({
        schema: refSchema,
        schemas: { "http://schema-fixture.test/person.json": personSchema },
      });
      return validator.validate({ name: "io-monad", age: "secret" })
        .then(ret => {
          assert(ret.valid === false);
          assert(ret.errors.length === 1);
          assert(ret.missing.length === 0);
          assert(ret.errors[0].dataPath === "/age");
        });
    });
  });
});
