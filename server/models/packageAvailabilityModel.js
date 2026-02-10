import { pool } from '../config/db.js';

export async function getAvailability(packageId) {
  const result = await pool.query(
    'select * from public.package_availability where package_id=$1',
    [packageId]
  );
  return result.rows[0] || null;
}

export async function upsertAvailability({ packageId, availabilityType, startDate, endDate, excludedWeekdays, specificDates, isOpen }) {
  const result = await pool.query(
    `insert into public.package_availability (
      package_id,
      availability_type,
      start_date,
      end_date,
      excluded_weekdays,
      specific_dates,
      is_open
    ) values ($1,$2,$3,$4,$5,$6,$7)
    on conflict (package_id)
    do update set
      availability_type=excluded.availability_type,
      start_date=excluded.start_date,
      end_date=excluded.end_date,
      excluded_weekdays=excluded.excluded_weekdays,
      specific_dates=excluded.specific_dates,
      is_open=excluded.is_open,
      updated_at=now()
    returning *`,
    [packageId, availabilityType, startDate, endDate, excludedWeekdays, specificDates, Boolean(isOpen)]
  );

  return result.rows[0];
}

export async function deleteAvailability(packageId) {
  const result = await pool.query(
    'delete from public.package_availability where package_id=$1 returning id',
    [packageId]
  );
  return result.rows[0]?.id || null;
}

export function isDateAvailable(availabilityRule, date) {
  if (!availabilityRule || !availabilityRule.is_open) {
    return false;
  }

  const checkDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkDate < today) {
    return false;
  }

  const { availability_type, start_date, end_date, excluded_weekdays, specific_dates } = availabilityRule;

  switch (availability_type) {
    case 'always':
      return true;

    case 'date_range':
      if (!start_date || !end_date) return false;
      const start = new Date(start_date);
      const end = new Date(end_date);
      return checkDate >= start && checkDate <= end;

    case 'specific_dates':
      if (!specific_dates || specific_dates.length === 0) return false;
      const dateStr = checkDate.toISOString().split('T')[0];
      return specific_dates.some(d => {
        const specificDateStr = new Date(d).toISOString().split('T')[0];
        return specificDateStr === dateStr;
      });

    case 'always_except':
      if (!excluded_weekdays || excluded_weekdays.length === 0) return true;
      const dayOfWeek = checkDate.getDay();
      return !excluded_weekdays.includes(dayOfWeek);

    default:
      return false;
  }
}
