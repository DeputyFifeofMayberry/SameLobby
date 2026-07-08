import Link from "next/link";

const navItems = [
  { href: "/discover", label: "Discover" },
  { href: "/connections", label: "Connections" },
  { href: "/messages", label: "Messages" },
  { href: "/play", label: "Play" },
  { href: "/teammates", label: "Teammates" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <aside className="hidden border-r border-[var(--color-border)] bg-white md:block md:w-[var(--nav-width-desktop)]">
        <div className="p-6">
          <Link
            href="/discover"
            className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-night-navy)]"
          >
            SameLobby
          </Link>
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-text-slate)] hover:bg-[var(--color-cloud)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-4">
          <Link
            href="/profile"
            className="block text-sm text-[var(--color-lobby-teal)]"
          >
            Profile
          </Link>
          <Link
            href="/settings/account"
            className="mt-2 block text-sm text-[var(--color-lobby-teal)]"
          >
            Settings
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-white px-4 py-3 md:hidden">
          <Link
            href="/discover"
            className="font-[family-name:var(--font-display)] font-bold"
          >
            SameLobby
          </Link>
          <Link
            href="/profile"
            className="text-sm text-[var(--color-lobby-teal)]"
          >
            Profile
          </Link>
          <Link
            href="/settings/account"
            className="text-sm text-[var(--color-lobby-teal)]"
          >
            Settings
          </Link>
        </header>
        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
        <nav
          aria-label="Primary"
          className="fixed right-0 bottom-0 left-0 flex border-t border-[var(--color-border)] bg-white md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[var(--nav-height-mobile)] flex-1 flex-col items-center justify-center text-xs text-[var(--color-text-slate)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
