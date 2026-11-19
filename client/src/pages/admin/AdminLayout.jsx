import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/destinations', icon: 'explore', label: 'Destinations' },
  { to: '/admin/hotels', icon: 'hotel', label: 'Hotels' },
  { to: '/admin/homestays', icon: 'home', label: 'Homestays' },
  { to: '/admin/houseboats', icon: 'sailing', label: 'Houseboats' },
  { to: '/admin/packages', icon: 'card_travel', label: 'Packages' },
  { to: '/admin/treks', icon: 'terrain', label: 'Treks' },
  { to: '/admin/routes', icon: 'alt_route', label: 'Route Catalogue' },
  { to: '/admin/activities', icon: 'sports', label: 'Activities' },
  { to: '/admin/articles', icon: 'article', label: 'Articles' },
  { to: '/admin/books', icon: 'menu_book', label: 'Books' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-dark h-dvh bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300">
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="material-icons text-[#FF8C00] text-xl">landscape</span>
          <span className="text-sm font-bold text-slate-100">Admin Panel</span>
        </div>
        <button onClick={handleLogout} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400">
          <span className="material-icons text-[20px]">logout</span>
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-50 shadow-xl transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="material-icons text-[#FF8C00] text-2xl">landscape</span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white tracking-tight">Kashmir Offbeat</span>
              <span className="text-xs text-white/90 font-medium">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 md:hidden">
            <span className="material-icons text-[20px]">close</span>
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 font-semibold border-l-4 border-[#EA580C]'
                    : 'text-white hover:bg-slate-800/70 hover:text-orange-200'
                }`
              }
            >
              <span className="material-icons text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#C2410C] flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/80 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="flex-1 text-sm text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-slate-800 transition-all border border-slate-700">
              <span className="material-icons text-[14px] mr-1 align-middle">home</span> Site
            </button>
            <button onClick={handleLogout} className="flex-1 text-sm text-slate-300 hover:text-red-400 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all border border-slate-700">
              <span className="material-icons text-[14px] mr-1 align-middle">logout</span> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-64 pt-16 md:pt-8 p-4 md:p-8 overflow-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
