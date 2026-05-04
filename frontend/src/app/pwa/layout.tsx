export default function PWALayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-xl min-h-screen relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
