import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldUser } from 'lucide-react';

import { cn } from '@/lib/utils';
import logo from '@/app/icon.svg';

import { Button } from './ui/button';

interface MainNavProps {
  items?: NavItem[];
  admin?: boolean;
}

export function MainNav({ items, admin }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Image src={logo} width={36} height={36} alt="Logo ALO" />
        <span className="inline-flex gap-1 font-bold">
          ALObirynt
          {admin && (
            <span className="text-muted-foreground">
              <ShieldUser />
            </span>
          )}
        </span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-2">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link key={index} href={item.href}>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      item.disabled
                        ? 'cursor-not-allowed opacity-80'
                        : 'cursor-pointer'
                    )}
                  >
                    {item.title}
                  </Button>
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
