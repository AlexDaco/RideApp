import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
    </SessionProvider>
  );
}
