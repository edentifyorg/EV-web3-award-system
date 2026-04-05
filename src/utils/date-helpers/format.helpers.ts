import { dayjs } from '../dayjs';

export const formattedLocalDate = (
  utcDate: Date,
  timezone: string,
  format: string = 'YYYY-MM-DDTHH:mm:ss'
): string => {
  return dayjs.utc(utcDate).tz(timezone).format(format);
};
