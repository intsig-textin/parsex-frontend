import dayjs from 'dayjs';

const isToday = require('dayjs/plugin/isToday');

dayjs.extend(isToday);

/**
 *
 * @param time 精确到秒
 * @return 小于当天 HH:mm, 当年 MM/DD 往年 YYYY/MM/DD
 */
export function convertTime(time: number) {
  const today = dayjs(time * 1000);

  if (today.isSame(dayjs(), 'day')) {
    return today.format('HH:mm');
  }
  if (dayjs(new Date()).year() - today.year() >= 1) {
    return today.format('YYYY/MM/DD');
  }
  return today.format('MM/DD');
}
export function formatTime(time: number, pattern: string) {
  const day = dayjs(time * 1000);
  return day.format(pattern);
}
