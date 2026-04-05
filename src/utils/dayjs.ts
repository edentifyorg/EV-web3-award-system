import dayjsOrig, { Dayjs as _Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjsOrig.extend(utc);
dayjsOrig.extend(timezone);
dayjsOrig.extend(isSameOrBefore);

export const dayjs = dayjsOrig;
export type Dayjs = _Dayjs;
