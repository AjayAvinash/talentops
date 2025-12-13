import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  Layers,
  Bell
} from 'lucide-react';
import { useApp } from '../context/Store';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-0.5
      ${isActive 
        ? 'bg-white text-emerald-700 shadow-sm border border-gray-200/50' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
  >
    <Icon size={18} className={`mr-3 ${({ isActive }: any) => isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
    {label}
  </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useApp();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#F7F7F5] border-r border-gray-200 fixed inset-y-0 left-0 z-20 hidden md:flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-gray-200/50">
          <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-xs mr-2.5">
            T
          </div>
          <span className="text-base font-semibold text-gray-900 tracking-tight">TalentOps</span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</p>
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/candidates" icon={Users} label="Candidates" />
            <NavItem to="/jobs" icon={Briefcase} label="Jobs" />
            <NavItem to="/pools" icon={Layers} label="Talent Pools" />
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200/50">
          <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              JD
            </div>
            <div className="ml-2.5">
              <p className="text-sm font-medium text-gray-900">Jane Doe</p>
              <p className="text-xs text-gray-500">Recruiter Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Placeholder */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-30 h-16 flex items-center px-4 justify-between">
        <span className="font-bold text-gray-900">TalentOps</span>
        <div className="flex space-x-4">
             <NavLink to="/" className="text-gray-500"><LayoutDashboard size={24}/></NavLink>
             <NavLink to="/candidates" className="text-gray-500"><Users size={24}/></NavLink>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 min-h-screen pt-16 md:pt-0 bg-white">
         {/* Top Header for Mobile */}
         <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex justify-end items-center md:hidden">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
         </div>

        {/* Removed max-w-7xl and reduced padding to maximize space */}
        <div className="p-4 md:p-6 w-full animate-[fade-in_0.3s_ease-out]">
          {loading ? (
             <div className="flex items-center justify-center h-[80vh]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
             </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
};