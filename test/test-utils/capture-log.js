import gutil from "gulp-util";

export default function captureLog(fn) {
  return new Promise((resolve, reject) => {
    const realGutilLog = gutil.log;
    const colorsEnabled = gutil.colors.enabled;
    const restore = () => {
      gutil.log = realGutilLog;
      gutil.colors.enabled = colorsEnabled;
    };

    const lines = [];
    gutil.log = function (...args) {
      lines.push(args.join(" "));
    };
    gutil.colors.enabled = false;

    try {
      Promise.resolve(fn()).then(() => {
        restore();
        resolve(lines);
      }).catch(err => {
        restore();
        reject(err);
      });
    } catch (e) {
      restore();
      reject(e);
    }
  });
}
