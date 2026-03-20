import {
  BarChart2,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { PageName } from "../types";

interface LayoutProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  children: React.ReactNode;
}

const navItems: { id: PageName; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={18} /> },
  { id: "employees", label: "Employees", icon: <Users size={18} /> },
  {
    id: "onboarding",
    label: "Onboarding & Offboarding",
    icon: <UserCheck size={18} />,
  },
  { id: "audit", label: "Audit", icon: <ClipboardList size={18} /> },
  { id: "reports", label: "Reports", icon: <BarChart2 size={18} /> },
];

export default function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden w-full h-full cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0f172a] flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">
            Asset Manager Pro
          </span>
          <button
            type="button"
            className="ml-auto text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                currentPage === item.id
                  ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin link at bottom */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => {
              onNavigate("admin");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
              currentPage === "admin"
                ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings size={18} />
            <span>Admin Settings</span>
          </button>
        </div>

        {/* Profile */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div>
              <p className="text-white text-sm font-medium">Admin User</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shrink-0">
          <button
            type="button"
            className="text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 hidden sm:block">
            IT Asset Management System
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
              />
            </div>
            <button
              type="button"
              className="relative p-2 text-gray-500 hover:text-gray-700"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
