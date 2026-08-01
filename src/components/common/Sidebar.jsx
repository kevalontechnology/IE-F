import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Ship,
  FileCheck,
  Building2,
  UserCheck,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { isAdmin, isSupervisor, isSales } = useAuth();

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Supervisor', 'Sales'] },
    { title: 'Customers', path: '/customers', icon: Users, roles: ['Admin', 'Supervisor', 'Sales'] },
    { title: 'Products', path: '/products', icon: Package, roles: ['Admin', 'Supervisor', 'Sales'] },
    { title: 'Quotations', path: '/quotations', icon: FileText, roles: ['Admin', 'Supervisor', 'Sales'] },
    { title: 'Shipments', path: '/shipments', icon: Ship, roles: ['Admin', 'Supervisor', 'Sales'] },
    { title: 'Document Center', path: '/documents', icon: FileCheck, roles: ['Admin', 'Supervisor'] },
    { title: 'User Approvals', path: '/users', icon: UserCheck, roles: ['Admin'] },
    { title: 'Company Settings', path: '/company', icon: Building2, roles: ['Admin'] },
    { title: 'Audit Logs', path: '/audit-logs', icon: Activity, roles: ['Admin'] },
    { title: 'Backup & Restore', path: '/backup', icon: Database, roles: ['Admin'] },
  ];

  return (
    <aside
      className={`relative z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm text-white leading-none">EXPORT CRM</h1>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise System</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Check role permissions
          const hasAccess = item.roles.some((r) => {
            if (r === 'Admin') return isAdmin;
            if (r === 'Supervisor') return isSupervisor;
            if (r === 'Sales') return isSales;
            return false;
          });

          if (!hasAccess) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
              title={collapsed ? item.title : ''}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500">
          <p>© 2026 Enterprise Export CRM</p>
          <p>Single Entry Architecture v1.0</p>
        </div>
      )}
    </aside>
  );
}
