import type { RawTownWeather } from '../types/weather';

export function mergeRawTownWeather(
  previous: RawTownWeather | undefined,
  updates: RawTownWeather,
): RawTownWeather {
  if (!previous) {
    return updates;
  }

  const currentDate = updates.current.time.slice(0, 10);
  const hourlyCutoff = shiftLocalHour(updates.current.time, -24);
  const dailyCutoff = shiftLocalDate(currentDate, -6);
  const hourlyByTime = new Map(
    previous.hourly.map(hour => [hour.time, hour]),
  );
  const dailyByDate = new Map(previous.daily.map(day => [day.date, day]));

  updates.hourly.forEach(hour => hourlyByTime.set(hour.time, hour));
  updates.daily.forEach(day => dailyByDate.set(day.date, day));

  return {
    timezone: updates.timezone,
    current: updates.current,
    hourly: [...hourlyByTime.values()]
      .filter(hour => hour.time >= hourlyCutoff)
      .sort((left, right) => left.time.localeCompare(right.time)),
    daily: [...dailyByDate.values()]
      .filter(day => day.date >= dailyCutoff)
      .sort((left, right) => left.date.localeCompare(right.date)),
  };
}

function shiftLocalHour(time: string, hours: number): string {
  const [date, hour] = time.slice(0, 13).split('T');
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day, Number(hour) + hours));

  return `${shifted.toISOString().slice(0, 13)}:00`;
}

function shiftLocalDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));

  return shifted.toISOString().slice(0, 10);
}