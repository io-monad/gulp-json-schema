import fs from "fs";
import stripBOM from "strip-bom";
import request from "request";
import normalizeURL from "normalize-url";

export default class SchemaLoader {
  constructor(options) {
    this.options = options || {};
    this.requestOptions = this.options.requestOptions || {};
  }

  parseJSON(json) {
    return JSON.parse(stripBOM(json));
  }

  loadLocalSchemaSync(filePath) {
    const contents = fs.readFileSync(filePath, "utf8");
    return this.parseJSON(contents);
  }

  loadRemoteSchema(uri) {
    return new Promise((resolve, reject) => {
      request(uri, this.requestOptions, (err, res, body) => {
        if (err) {
          return reject(new Error(`Failed to load schema "${uri}": ${err.message || err}`));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to load schema "${uri}": HTTP status ${res.statusCode}`));
        }
        resolve(this.parseJSON(body));
      });
    });
  }

  loadRemoteSchemas(uris) {
    return new Promise((resolve, reject) => {
      const results = {};
      const queue = Array.prototype.slice.call(uris);
      const next = () => {
        if (queue.length === 0) {
          return resolve(results);
        }

        const uri = normalizeURL(queue.shift());
        if (results.hasOwnProperty(uri)) return setImmediate(next);

        this.loadRemoteSchema(uri)
        .then(schema => {
          results[uri] = schema;
          setImmediate(next);
        })
        .catch(reject);
      };
      next();
    });
  }
}
