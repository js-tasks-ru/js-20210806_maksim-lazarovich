/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let countOfRepeat = 0;
  let prevValue = '';
  let resultString = '';

  if (size !== undefined) {

    if (size === 0) {
      return resultString;
    }

    for (let item of string) {

      countOfRepeat++;

      if (item !== prevValue) {
        countOfRepeat = 1;
      }

      if (countOfRepeat <= size) {
        resultString += item;
      }

      prevValue = item;
    }

    return resultString;
  }

  return string;
}
