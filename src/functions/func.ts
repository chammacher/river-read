interface ScoreColor {
    bgColor: string;
    textColor: string;
    outline: string;
}

export function getScoreColor(score: number): ScoreColor {
  const primary = '#1c3829';
  const base = '#ebe8e1';
  const tertiary = '#c86d3b';
  const neutral = '#f4f1ea';

  const outline = '#c2c8c1';

  const lightText = '#ffffff';
  const darkText = '#727973';

  if (score >= 8.5) {
    return {
      bgColor: base,
      textColor: lightText,
      outline,
    };
  } else if (score >= 7) {
    return {
      bgColor: primary,
      textColor: lightText,
      outline,
    };
  } else if (score >= 5) {
    return {
      bgColor: neutral,
      textColor: darkText,
      outline,
    };
  } else {
    return {
      bgColor: tertiary,
      textColor: lightText,
      outline,
    };
  }
}

type CoordinateType = 'latitude' | 'longitude';

export function formatCoordinate(value: number, type: CoordinateType): string {
  const absolute = Math.abs(value);

  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;

  let direction: 'N' | 'S' | 'E' | 'W';

  if (type === 'latitude') {
    direction = value >= 0 ? 'N' : 'S';
  } else {
    direction = value >= 0 ? 'E' : 'W';
  }

  return `${degrees}°${minutes}′${seconds.toFixed(0)}″${direction}`;
}

export function formatWeatherTime(time: string): string {
  const hour = Number(time.substring(11, 13));

  if (hour === 0) {
    return '12 AM';
  }

  if (hour === 12) {
    return '12 PM';
  }

  if (hour > 12) {
    return `${hour - 12} PM`;
  }

  return `${hour} AM`;
}

export function formatHour(hour: number): string {
  const normalized = hour % 24;

  if (normalized === 0) {
    return '12 AM';
  }

  if (normalized === 12) {
    return '12 PM';
  }

  if (normalized > 12) {
    return `${normalized - 12} PM`;
  }

  return `${normalized} AM`;
}

export function getDecimalHour(dateTime: string): number {
  const time = dateTime.split('T')[1];

  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(':').map(Number);

  return hours + minutes / 60;
}

export function formatDecimalHour(
  decimalHour: number,
): string {
  let hour = Math.floor(decimalHour);

  let minutes = Math.round(
    (decimalHour - hour) * 60,
  );

  if (minutes === 60) {
    hour += 1;
    minutes = 0;
  }

  const normalizedHour =
    hour % 24;

  const suffix =
    normalizedHour >= 12
      ? 'PM'
      : 'AM';

  const displayHour =
    normalizedHour % 12 || 12;

  return `${displayHour}:${minutes
    .toString()
    .padStart(2, '0')} ${suffix}`;
}

export function formatDateTimeTime(dateTime: string): string {
  const decimal = getDecimalHour(dateTime);

  const hour = Math.floor(decimal);

  const minutes = Math.round((decimal - hour) * 60);

  const suffix = hour >= 12 ? 'PM' : 'AM';

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

const WEATHER_STALE_MS = 15 * 60 * 1000;

export function isWeatherStale(lastUpdated: string): boolean {
  return Date.now() - new Date(lastUpdated).getTime() > WEATHER_STALE_MS;
}

export function getWeatherAgeMinutes(lastUpdated: string): number {
  return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 60000);
}
