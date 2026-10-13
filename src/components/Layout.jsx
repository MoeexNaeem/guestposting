'use client';

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import {
  Globe,
  History,
  ShoppingBag,
  PlusSquare,
  LogOut,
  ShieldCheck,
  Bell,
  User,
  Users,
  Layers,
  Info,
  CheckCircle2,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = userInfo?._id;

  // Notifications are refreshed every few seconds while the tab is visible;
  // a newly arrived chat message pops the live toast.
  useEffect(() => {
    if (!userId) return;
    let seen = null;
    let stopped = false;

    const fetchNotifs = async () => {
      if (document.hidden) return;
      try {
        const { data } = await api.get("/notifications");
        if (stopped) return;
        if (seen) {
          const fresh = data.find((n) => !seen.has(n._id) && n.type === "message" && !n.isRead);
          if (fresh) {
            setLiveToast(fresh);
            setTimeout(() => setLiveToast(null), 5000);
          }
        }
        seen = new Set(data.map((n) => n._id));
        setNotifications((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
      } catch (err) {
        console.error("Error fetching notifications");
      }
    };

    fetchNotifs();
    const timer = setInterval(fetchNotifs, 5000);
    const onVisible = () => { if (!document.hidden) fetchNotifs(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId]);

  // --- NEW: NOTIFICATION HANDLERS ---
  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setShowNotifs(false);
      router.push(notif.link);
    } catch (err) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error clearing notifications");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    router.push("/login");
  };

  const menuItems = [
    { name: "Marketplace", icon: <Globe size={16} />, path: "/marketplace", roles: ["buyer", "seller", "admin"] },
    { name: userInfo?.role === "seller" ? "My Sales" : "My Purchases", icon: <ShoppingBag size={16} />, path: "/orders", roles: ["buyer", "seller", "admin"] },
    { name: "Add Website", icon: <PlusSquare size={16} />, path: "/add-listing", roles: ["seller", "admin"] },
    { name: "My Inventory", icon: <Layers size={16} />, path: "/my-listings", roles: ["seller", "admin"] },
    { name: "Wallet & Payouts", icon: <LayoutDashboard size={16} />, path: "/wallet", roles: ["buyer", "seller", "admin"] },
    { name: "Account Settings", icon: <User size={16} />, path: "/profile", roles: ["buyer", "seller", "admin"] },
  ];

  if (userInfo?.role === "admin") {
    menuItems.push({ name: "Platform Stats", icon: <ShieldCheck size={16} />, path: "/admin", roles: ["admin"] });
    menuItems.push({ name: "User Management", icon: <Users size={16} />, path: "/admin/users", roles: ["admin"] });
    menuItems.push({ name: "System Logs", icon: <History size={16} />, path: "/admin/logs", roles: ["admin"] });
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const currentPathName = pathname === "/" ? "Overview" : pathname.replace("/", "").replace("-", " ");

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-blue-200">
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 gap-3 mb-2">
          <div className="bg-slate-900 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] tracking-tighter">LR</div>
          <span className="text-[15px] font-semibold text-slate-900 tracking-tight">LetRank Workspace</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.roles.includes(userInfo?.role)) return null;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-slate-900 rounded-r-full"></div>}
                <span className={isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-md hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-semibold text-xs">
              {userInfo?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[13px] font-semibold text-slate-900 truncate">{userInfo?.name}</p>
              <p className="text-[11px] font-medium text-slate-500 capitalize">{userInfo?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <LogOut size={14} /> Sign out session
          </button>
        </div>
      </aside>

      <div className="fixed top-0 left-64 right-0 h-16 bg-white/70 backdrop-blur-xl z-10 flex items-center justify-between px-8 border-b border-slate-200/50">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500 capitalize">
          <span className="hover:text-slate-900 cursor-pointer">Dashboard</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold">{currentPathName}</span>
        </div>
        
        {/* --- UPDATED: NOTIFICATION BUTTON & PANEL --- */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors relative text-slate-500 hover:text-slate-900"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 size={24} strokeWidth={1.5} className="mb-2 text-slate-300" />
                    <p className="text-[13px] font-medium text-slate-500">All caught up.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleNotifClick(n)}
                      className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.isRead ? "bg-blue-50/30 hover:bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="mt-1.5 shrink-0">
                        {!n.isRead ? <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> : <div className="w-1.5 h-1.5 bg-transparent"></div>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] leading-snug ${!n.isRead ? "font-medium text-slate-900" : "font-normal text-slate-600"}`}>
                          {n.message}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">Just now</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 ml-64 pt-16 min-h-screen">
        <div className="p-8 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* --- LIVE TOAST NOTIFICATION --- */}
      {liveToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg p-4 pr-12 flex items-start gap-3 z-50 animate-in slide-in-from-right text-white w-80">
          <div className="mt-0.5 shrink-0 text-blue-400">
            <Info size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold mb-0.5 tracking-tight">New Activity</h4>
            <p className="text-[13px] font-normal text-slate-400 leading-snug">{liveToast.message}</p>
          </div>
          <button onClick={() => setLiveToast(null)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;