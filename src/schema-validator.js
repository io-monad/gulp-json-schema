import tv4 from "tv4";
import SchemaLoader from "./schema-loader";

const DEFAULT_OPTIONS = {
  schema: null,
  schemas: null,
  formats: null,
  keywords: null,
  configure: null,
  loadMissingSchemas: false,
  checkRecursive: false,
  banUnknownProperties: false,
  loader: null,
};

export default class SchemaValidator {
  constructor(options) {
    this.options = options;
    this.loader = this.options.loader || new SchemaLoader(this.options);
    this.schema = this.wrapSchema(this.options.schema);
    this.tv4 = tv4.freshApi();

    if (options.schemas) {
      this.addSchemas(options.schemas);
    }
    if (options.formats) {
      this.tv4.addFormat(options.formats);
    }
    if (options.keywords) {
      this.defineKeywords(options.keywords);
    }
    if (options.configure) {
      options.configure.call(null, this.tv4, this.options);
    }
  }

  wrapSchema(schemaOrFilePath) {
    if (typeof schemaOrFilePath === "string") {
      return this.loader.loadLocalSchemaSync(schemaOrFilePath);
    } else {
      return schemaOrFilePath;
    }
  }

  addSchemas(schemas) {
    if (Array.isArray(schemas)) {
      schemas.forEach(s => {
        this.tv4.addSchema(this.wrapSchema(s));
      });
    } else {
      Object.keys(schemas).forEach(k => {
        this.tv4.addSchema(k, this.wrapSchema(schemas[k]));
      });
    }
  }

  defineKeywords(keywords) {
    Object.keys(keywords).forEach(k => {
      this.tv4.defineKeyword(k, keywords[k]);
    });
  }

  validateJSON(json) {
    return new Promise(resolve => {
      const data = this.loader.parseJSON(json);
      resolve(this.validate(data));
    });
  }

  validate(data) {
    return new Promise(resolve => {
      const result = this.callValidateMultiple(data);

      if (result.missing && result.missing.length > 0 && this.options.loadMissingSchemas) {
        resolve(
          this.loadMissing(result.missing)
          .then(() => this.callValidateMultiple(data))
        );
        return;
      }

      resolve(result);
    });
  }

  callValidateMultiple(data) {
    return this.tv4.validateMultiple(
      data,
      this.schema,
      this.options.checkRecursive,
      this.options.banUnknownProperties
    );
  }

  loadMissing(missings) {
    return this.loader.loadRemoteSchemas(missings).then(schemas => {
      Object.keys(schemas).forEach(k => {
        this.tv4.addSchema(k, schemas[k]);
      });
    });
  }
}
