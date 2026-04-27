export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="bg-white text-foreground">{children}</div>;
}
