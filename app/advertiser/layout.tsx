import { AdvertiserSidebar } from "./components/AdvertiserSidebar";

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdvertiserSidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
