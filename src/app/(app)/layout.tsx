import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getAccountRouteRedirect } from "@/domains/accounts/account-guard";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }

  const account = await getAccountForUser(user.id);
  const pathname = (await headers()).get("x-pathname") ?? "";
  const routeRedirect = getAccountRouteRedirect(account, pathname);
  if (routeRedirect) {
    redirect(routeRedirect);
  }

  return <AppShell>{children}</AppShell>;
}
