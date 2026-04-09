import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود | BestieeCP",
  description: "ورود به پنل مدیریت سازمانی بستی",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-stretch justify-center">
      {children}
    </main>
  );
}
