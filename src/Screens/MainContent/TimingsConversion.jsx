const RELATIVE_RANGES = {
  "1minute": { unit: "minutes", value: 1 },
  "5minutes": { unit: "minutes", value: 5 },
  "10minutes": { unit: "minutes", value: 10 },
  "15minutes": { unit: "minutes", value: 15 },
  "30minutes": { unit: "minutes", value: 30 },
  "1hour": { unit: "hours", value: 1 },
  "4hours": { unit: "hours", value: 4 },
  "8hours": { unit: "hours", value: 8 },
};

function pad(n) {
  return n.toString().padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function resolveCalendarRange(timeRange, now) {
  switch (timeRange) {
    case "today":
      return { start: startOfDay(now), end: new Date(now) };

    case "last24h":
      return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: new Date(now) };

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }

    case "WTD": {
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - now.getDay());
      return { start: startOfDay(sunday), end: new Date(now) };
    }

    case "MTD": {
      const firstOfMonth = new Date(now);
      firstOfMonth.setDate(1);
      return { start: startOfDay(firstOfMonth), end: new Date(now) };
    }

    case "YTD": {
      const firstOfYear = new Date(now);
      firstOfYear.setMonth(0, 1);
      return { start: startOfDay(firstOfYear), end: new Date(now) };
    }

    default:
      return { start: startOfDay(now), end: new Date(now) };
  }
}

export function TimingsConversion(timeRange) {
  const now = new Date();

  const relative = RELATIVE_RANGES[timeRange];
  let start_time, end_time;

  if (relative) {
    start_time = new Date(now);
    if (relative.unit === "minutes") {
      start_time.setMinutes(start_time.getMinutes() - relative.value);
    } else {
      start_time.setHours(start_time.getHours() - relative.value);
    }
    end_time = new Date(now);
  } else {
    ({ start: start_time, end: end_time } = resolveCalendarRange(timeRange, now));
  }

  return [formatDate(start_time), formatDate(end_time)];
}