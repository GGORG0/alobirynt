import { SiteHeader } from '@/components/site-header';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader admin />
      <div className="flex-1">{children}</div>
    </div>
  );
}
