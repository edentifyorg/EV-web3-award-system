import { dayjs, Dayjs } from '../dayjs';

const TIMEZONE = 'Europe/Belgrade';

export function localNow(tz: string = TIMEZONE): Dayjs {
  return dayjs().tz(tz);
}

export function localStartOfDay(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).startOf('day');
}

export function localEndOfDay(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).endOf('day');
}

export function localStartOfMonth(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).startOf('month');
}

export function localEndOfMonth(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).endOf('month');
}

export function localStartOfYear(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).startOf('year');
}

export function localEndOfYear(
  date: string | Date | Dayjs = dayjs(),
  tz: string = TIMEZONE
): Dayjs {
  return dayjs(date).tz(tz).endOf('year');
}
