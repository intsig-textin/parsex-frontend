import accounting from 'accounting';

export function convertVal(val: string | number, precision?: any) {
  if (typeof val === 'number') {
    return formatMoney(val, precision);
  }

  return val || '-';
}
export function isInteger(val: number | string) {
  val = String(val);
  const [, decimal] = val.split('.');
  return !decimal;
}
function fixedZero(str: string | string[]): string {
  const strArr = Array.isArray(str) ? str : str.split('');
  if (!strArr.length) return '';
  const curNumber = strArr.pop();
  if (curNumber && Number(curNumber) !== 0) return [...strArr, curNumber].join('');
  return fixedZero(strArr);
}
export const convertPrise = (val: number | string, precision = 3): number => {
  const [start, end] = String(val).split('.');
  if (!end) return parseFloat(start);
  let thousand = end.substring(0, precision);
  thousand = fixedZero(thousand);

  return parseFloat(`${start}.${thousand}`);
};
export function isBase64(str: string) {
  if (str === '' || str.trim() === '') {
    return false;
  }
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

export const moneyPrecision = 4;

export function formatMoney(money: any, precision = moneyPrecision) {
  const integer = accounting.formatNumber(money || 0, precision).split('.')[0];
  const decimal = String(parseFloat(money || 0)).split('.')[1];
  return integer + (decimal ? `.${decimal}` : '');
}

export function formatNumber(number: number, precision = 0) {
  return accounting.formatNumber(number, precision);
}
function getMaxNum(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((acc, cur) => Math.max(acc, cur));
}
export function transformDecimalToInt(arr: number[]) {
  const decimalLens = arr
    .map(String)
    .map((item) => item.split('.')[1])
    .filter((item) => item && item.length > 0)
    .map((item) => item.length);
  const max = getMaxNum(decimalLens);
  const intArray = arr.map((item) => {
    const itemToString = String(item);
    const decimal = itemToString.split('.')[1];
    const len = decimal ? decimal.length : 0;
    const diff = Math.abs(max - len);
    const m = Math.pow(10, diff);

    return Number(itemToString.replace('.', '')) * m;
  });
  return {
    max,
    intArray,
  };
}
export function floatAdd(...args: number[]) {
  if (!args.length) return 0;
  try {
    const { intArray, max } = transformDecimalToInt(args);
    return intArray.reduce((acc, cur) => acc + cur) / Math.pow(10, max);
    // const maxDecimalLen = getMaxNum(decimalLens);
    // const m = Math.pow(10, maxDecimalLen);
    // return args.map((item) => item * m).reduce((acc, cur) => acc + cur, 0) / m;
  } catch {
    return 0;
  }
}
