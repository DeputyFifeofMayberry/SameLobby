export type ConcurrencyBarrier = {
  release: () => void;
  wait: () => Promise<void>;
};

export function createBarrier(): ConcurrencyBarrier {
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { release, wait: () => wait };
}
