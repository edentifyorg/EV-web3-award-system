import { Dayjs, dayjs } from '../dayjs';

export function utcNow(): Dayjs {
  return dayjs.utc();
}

export function utcStartOfDay(
  date: string | Date | Dayjs = dayjs.utc()
): Dayjs {
  return dayjs.utc(date).startOf('day');
}

export function utcEndOfDay(date: string | Date | Dayjs = dayjs.utc()): Dayjs {
  return dayjs.utc(date).endOf('day');
}

export function utcStartOfMonth(
  date: string | Date | Dayjs = dayjs.utc()
): Dayjs {
  return dayjs.utc(date).startOf('month');
}

export function utcEndOfMonth(
  date: string | Date | Dayjs = dayjs.utc()
): Dayjs {
  return dayjs.utc(date).endOf('month');
}

export function utcStartOfYear(
  date: string | Date | Dayjs = dayjs.utc()
): Dayjs {
  return dayjs.utc(date).startOf('year');
}

export function utcEndOfYear(date: string | Date | Dayjs = dayjs.utc()): Dayjs {
  return dayjs.utc(date).endOf('year');
}
