import {
  Squares2X2Icon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { label: "Dashboard", icon: Squares2X2Icon, active: true },
  { label: "Analytics", icon: ChartBarIcon },
  { label: "Agents", icon: UserGroupIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  return (
    <aside className="group w-20 hover:w-64 overflow-hidden transition-all duration-300 border-r border-border-subtle bg-surface px-3 py-6">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-2 px-2">
        {/* CI always visible */}
        <span className="text-lg font-semibold text-brand-primary">
          CI
        </span>

        {/* Full name only when expanded */}
        <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-40">
          <span className="whitespace-nowrap text-lg font-semibold text-text-primary">
            CallInsight
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 ${
                item.active
                  ? "border border-brand-primary"
                  : "border border-transparent hover:border-brand-primary hover:-translate-y-[1px]"
              }`}
            >
              {/* Icon */}
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  item.active
                    ? "text-brand-primary"
                    : "text-text-muted group-hover:text-text-primary"
                }`}
              />

              {/* Label */}
              <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-40">
                <span className="whitespace-nowrap text-sm text-text-primary">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
