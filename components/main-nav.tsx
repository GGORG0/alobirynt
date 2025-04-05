import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import logo from '@/app/icon.svg';

interface MainNavProps {
  items?: NavItem[];
  admin?: boolean;
}

export function MainNav({ items, admin }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Image src={logo} width={36} height={36} alt="Logo ALO" />
        <span className="inline-block font-bold">
          ALObirynt
          {admin && (
            <span className="text-muted-foreground ml-1 text-sm font-normal">
              Admin
            </span>
          )}
        </span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'text-muted-foreground flex items-center text-sm font-medium',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  );
}

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
}
