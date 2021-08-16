/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const splitGetter = path.split('.');
    let result = {...obj};

    if (Object.entries(obj).length) {
      for (const item of splitGetter) {
        result = result[item];
      }
      return result;
    }
  };
}
