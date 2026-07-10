let frozenNow: Date | null = null;

export function freezeTime(iso: string): void {
  frozenNow = new Date(iso);
}

export function unfreezeTime(): void {
  frozenNow = null;
}

export function now(): Date {
  return frozenNow ? new Date(frozenNow) : new Date();
}
