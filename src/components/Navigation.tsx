import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="h-6 w-6" />
              <span className="font-bold">Music Agent</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">Generator</Link>
            </Button>
            <Button
              variant={location.pathname === '/agents' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/agents">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/documentation' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/documentation">API Docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}