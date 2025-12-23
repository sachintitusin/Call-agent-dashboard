import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardContent from "./DashboardContent";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-app text-text-primary">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />
        <DashboardContent />
      </div>
    </div>
  );
}
