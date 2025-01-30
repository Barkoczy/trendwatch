'use client';
import React from 'react';
import { ModeToggle } from './ModeToggle';
import { Play } from 'lucide-react';

const Header = () => {
  return (
    <header className="dark:bg-background sticky top-0 z-50 w-full bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary flex items-center gap-2 transition-colors">
              <Play className="h-6 w-6" />
              <span className="text-xl font-bold">TrendWatch</span>
            </div>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
