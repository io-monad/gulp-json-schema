var gulp = require("gulp");
var jsonSchema = require("../");

var fixtureDir = "../test/fixture";
var schemaDir = fixtureDir + "/schema";
var dataDir = fixtureDir + "/data";

gulp.task("default", ["fail:verbose"]);

gulp.task("pass", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/person.json"));
});

gulp.task("pass:verbose", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/person.json", { verbose: true }));
});

gulp.task("pass:silent", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/person.json", { silent: true }));
});

gulp.task("fail", () => {
  return gulp.src(dataDir + "/person/*.json")
    .pipe(jsonSchema(schemaDir + "/person.json"));
});

gulp.task("fail:verbose", () => {
  return gulp.src(dataDir + "/person/*.json")
    .pipe(jsonSchema(schemaDir + "/person.json", { verbose: true }));
});

gulp.task("fail:silent", () => {
  return gulp.src(dataDir + "/person/*.json")
    .pipe(jsonSchema(schemaDir + "/person.json", { silent: true }));
});

gulp.task("fail:nonstop", () => {
  return gulp.src(dataDir + "/person/*.json")
    .pipe(jsonSchema(schemaDir + "/person.json", { emitError: false }));
});

gulp.task("fail:oneof", () => {
  return gulp.src(dataDir + "/oneof/*.json")
    .pipe(jsonSchema(schemaDir + "/oneof.json"));
});

gulp.task("missing", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/ref.json"));
});

gulp.task("missing:warn", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/ref.json", { missing: "warn" }));
});

gulp.task("missing:ignore", () => {
  return gulp.src(dataDir + "/person/*-valid.json")
    .pipe(jsonSchema(schemaDir + "/ref.json", { missing: "ignore" }));
});
