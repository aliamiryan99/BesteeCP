import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود | Barbers CP",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {children}
    </main>
  );
}
