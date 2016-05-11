import assert from "assert";
import nock from "nock";
import SchemaLoader from "../src/schema-loader";
import personSchema from "./fixture/schema/person.json";
import productSchema from "./fixture/schema/product.json";

describe("SchemaLoader", () => {
  const host = "http://schema-loader.test";

  let loader;
  beforeEach(() => {
    loader = new SchemaLoader();

    nock(host)
      .get("/person.json").reply(200, personSchema)
      .get("/product.json").reply(200, productSchema);
  });
  afterEach(() => {
    nock.cleanAll();
  });

  describe("#parseJSON", () => {
    it("parses JSON string", () => {
      const ret = loader.parseJSON('{ "foo": "bar", "baz": 123 }');
      assert.deepEqual(ret, { foo: "bar", baz: 123 });
    });

    it("strips BOM signature", () => {
      const ret = loader.parseJSON('\uFEFF{ "hello": "world" }');
      assert.deepEqual(ret, { hello: "world" });
    });
  });

  describe("#loadLocalSchemaSync", () => {
    it("loads a local schema file", () => {
      const ret = loader.loadLocalSchemaSync(__dirname + "/fixture/schema/person.json");
      assert.deepEqual(ret, personSchema);
    });

    it("throws error if file not exists", () => {
      assert.throws(() => { loader.loadLocalSchemaSync("nonexist.json"); });
    });
  });

  describe("#loadRemoteSchema", () => {
    it("fetches a schema file from remote server", () => {
      return loader.loadRemoteSchema(`${host}/person.json`)
        .then(ret => {
          assert.deepEqual(ret, personSchema);
        });
    });

    it("rejects Promise if failed to fetch", () => {
      return loader.loadRemoteSchema(`${host}/nonexist.json`)
        .then(() => { throw new Error("should not be resolved") })
        .catch(err => {
          assert(/^Failed to load schema/.test(err.message));
        });
    });
  });

  describe("#loadRemoteSchemas", () => {
    it("fetches all schema files from remote server", () => {
      return loader.loadRemoteSchemas([`${host}/person.json`, `${host}/product.json`])
        .then(rets => {
          assert.deepEqual(rets, {
            [`${host}/person.json`]: personSchema,
            [`${host}/product.json`]: productSchema,
          });
        });
    });

    it("rejects Promise if one of fetches failed", () => {
      return loader.loadRemoteSchemas([`${host}/person.json`, `${host}/nonexist.json`])
        .then(() => { throw new Error("should not be resolved") })
        .catch(err => {
          assert(/^Failed to load schema/.test(err.message));
        });
    });
  });
});
