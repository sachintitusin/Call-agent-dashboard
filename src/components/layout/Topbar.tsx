export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
      <h2 className="text-lg font-medium">Dashboard</h2>

      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-700" />
      </div>
    </header>
  );
}
