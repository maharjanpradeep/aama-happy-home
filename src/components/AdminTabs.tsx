import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/checkin", label: "Admin Dashboard" },
  { to: "/admin/social", label: "Social media & reviews" },
];

// Shown only to admins, at the top of both admin pages.
const AdminTabs = () => (
  <nav className="flex gap-1 border-b mb-8" aria-label="Admin sections">
    {TABS.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        end
        className={({ isActive }) =>
          cn(
            "px-4 py-2 -mb-px border-b-2 text-sm font-semibold transition-colors",
            isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
);

export default AdminTabs;
