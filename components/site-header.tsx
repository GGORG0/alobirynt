'use client';

import { usePathname } from 'next/navigation';

import AdminLogoutButton from '@/components/admin/logout-button';
import { MainNav, NavItem } from '@/components/main-nav';
import ProfileMenu from '@/components/profile-menu';
import ThemeToggle from '@/components/theme-toggle';

const navItems: { admin: NavItem[]; public: NavItem[] } = {
  admin: [
    { title: 'Główna', href: '/' },
    { title: 'Zadania', href: '/admin' },
    { title: 'Wyniki', href: '/admin/leaderboard' },
  ],
  public: [{ title: 'Zadania', href: '/' }],
};

export default function SiteHeader() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  const items = isAdmin ? navItems.admin : navItems.public;

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={items} admin={isAdmin} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!isAdmin && <ProfileMenu />}
            {isAdmin && <AdminLogoutButton />}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
