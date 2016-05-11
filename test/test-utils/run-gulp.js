import captureLog from "./capture-log";

export default function runGulp(fn, callback) {
  let error = null;
  return captureLog(() => new Promise(resolve => {
    fn()
    .on("finish", resolve)
    .on("error", err => {
      error = err;
      resolve();
    });
  })).then(logs => {
    return { logs, error };
  });
}
