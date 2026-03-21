import DriverNav from "./components/DriverNav";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto pb-24">
        {children}
      </main>
      <DriverNav />
    </div>
  );
}
