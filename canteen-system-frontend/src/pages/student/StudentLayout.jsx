import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function StudentLayout() {
  return (
    <div className="app-shell">
      <Sidebar role="STUDENT" />
      <div className="main-col">
        <TopBar title="Student Portal" />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
