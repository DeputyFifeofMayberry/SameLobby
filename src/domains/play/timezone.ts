export function formatInTimeZone(
  iso: string,
  ianaZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(iso);
  const defaults: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    ...options,
  };
  try {
    return new Intl.DateTimeFormat("en-US", {
      ...defaults,
      timeZone: ianaZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", defaults).format(date);
  }
}

export function formatSessionRange(
  startIso: string,
  lengthMinutes: number,
  viewerTz: string,
  otherTz: string,
): { viewerLabel: string; otherLabel: string | null } {
  const endIso = new Date(
    new Date(startIso).getTime() + lengthMinutes * 60_000,
  ).toISOString();

  const viewerLabel = `${formatInTimeZone(startIso, viewerTz)} – ${formatInTimeZone(endIso, viewerTz, { weekday: undefined })}`;

  if (viewerTz === otherTz) {
    return { viewerLabel, otherLabel: null };
  }

  const otherLabel = formatInTimeZone(startIso, otherTz);
  return { viewerLabel, otherLabel };
}

export function timeZoneAbbreviation(iso: string, ianaZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaZone,
      timeZoneName: "short",
    }).formatToParts(new Date(iso));
    return parts.find((p) => p.type === "timeZoneName")?.value ?? ianaZone;
  } catch {
    return ianaZone;
  }
}

/**
 * Parse a datetime-local value in the proposer's IANA zone to UTC ISO string.
 */
export function datetimeLocalToUtcIso(
  localValue: string,
  ianaZone: string,
): string | null {
  if (!localValue) return null;
  const match = localValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const probe = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00`,
  );
  if (Number.isNaN(probe.getTime())) return null;

  const utcGuess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const zonedAsUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
  );

  const offsetMs = zonedAsUtc - utcGuess;
  return new Date(utcGuess - offsetMs).toISOString();
}

export function generateIcsEvent(input: {
  uid: string;
  summary: string;
  startIso: string;
  endIso: string;
}): string {
  const formatUtc = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SameLobby//Play Session//EN",
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${formatUtc(new Date().toISOString())}`,
    `DTSTART:${formatUtc(input.startIso)}`,
    `DTEND:${formatUtc(input.endIso)}`,
    `SUMMARY:${input.summary}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
