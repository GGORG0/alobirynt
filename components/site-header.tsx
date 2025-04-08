'use client';

import { usePathname } from 'next/navigation';

import ThemeToggle from '@/components/theme-toggle';

import { MainNav, NavItem } from './main-nav';

const navItems: { admin: NavItem[]; public: NavItem[] } = {
  admin: [
    { title: 'Główna', href: '/' },
    { title: 'Zadania', href: '/admin' },
    { title: 'Uczestnicy', href: '/admin/users' },
  ],
  public: [
    { title: 'Zadania', href: '/' },
    { title: 'Admin', href: '/admin' },
  ],
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
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
