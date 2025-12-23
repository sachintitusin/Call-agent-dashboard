export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-surface px-6">
      {/* Page title */}
      <h2 className="text-lg font-medium text-text-primary">
        Dashboard
      </h2>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <img
          src="/woman.png"
          alt="User avatar"
          className="
            h-9 w-9
            rounded-full
            object-cover
            ring-1 ring-white/10
          "
        />
      </div>
    </header>
  );
}
