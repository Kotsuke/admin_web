'use client';
// app/page.tsx


import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Map, LogOut, Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Cek Login saat halaman dimuat
  useEffect(() => {
    const token = Cookies.get('admin_token');
    if (!token) {
      router.push('/'); // Tendang ke login kalau gak ada token
    } else {
      setUser(JSON.parse(token));
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('admin_token');
    router.push('/');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Laporan Masuk', href: '/dashboard/posts', icon: FileText },
    { name: 'Data Users', href: '/dashboard/users', icon: Users },
    { name: 'Peta Sebaran', href: '/dashboard/map', icon: Map },
  ];

  if (!user) return null; // Jangan render apa-apa sebelum cek login selesai

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside 
        className={`bg-white text-gray-800 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className={`font-bold text-xl text-blue-600 ${!isSidebarOpen && 'hidden'}`}>
            SmartInfra
          </h1>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded">
             <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <item.icon size={24} />
                <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={24} />
            <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}