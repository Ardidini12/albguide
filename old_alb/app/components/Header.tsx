"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Plane, User, Heart, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  } | null;
}

export function Header({ user, profile }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-serif text-xl text-gray-900">Discover Albania</div>
              <div className="text-xs text-gray-600">Your Journey Begins Here</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" className="px-4 py-2 hover:text-red-700">
                  Home
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Packages</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <Link href="/packages" className="block p-3 rounded-lg hover:bg-gray-50">
                      <div>All Vacation Packages</div>
                      <p className="text-sm text-gray-600">Browse by region and theme</p>
                    </Link>
                    <Link href="/group-travel" className="block p-3 rounded-lg hover:bg-gray-50">
                      <div>Group Travel</div>
                      <p className="text-sm text-gray-600">Travel together</p>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <Link href="/business" className="block p-3 rounded-lg hover:bg-gray-50">
                      <div>Business Travel</div>
                      <p className="text-sm text-gray-600">Corporate solutions</p>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/guides" className="px-4 py-2 hover:text-red-700">
                  Destination Guides
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Support</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4"> 
                    <Link href="/emergency" className="block p-3 rounded-lg hover:bg-gray-50">
                      <div>Emergency Support</div>
                      <p className="text-sm text-gray-600">24/7 assistance</p>
                    </Link>
                    <Link href="/testimonials" className="block p-3 rounded-lg hover:bg-gray-50">
                      <div>Reviews</div>
                      <p className="text-sm text-gray-600">Customer stories</p>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button / User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                {profile?.role === 'ADMIN' && (
                  <Button variant="outline" asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      {profile?.first_name || profile?.last_name 
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                        : user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favourites" className="cursor-pointer">
                        <Heart className="w-4 h-4 mr-2" />
                        Favourites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Home</Link>
              <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Vacation Packages</Link>
              <Link href="/booking" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Booking</Link>
              <Link href="/guides" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Destination Guides</Link>
              <Link href="/group-travel" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Group Travel</Link>
              <Link href="/business" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Business Travel</Link>
              <Link href="/emergency" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Emergency</Link>
              <Link href="/testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Reviews</Link>
              {user ? (
                <>
                  <div className="border-t my-2"></div>
                  {profile?.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Admin Panel</Link>
                  )}
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Profile</Link>
                  <Link href="/favourites" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Favourites</Link>
                  <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-50 rounded text-left w-full">Logout</button>
                </>
              ) : (
                <>
                  <div className="border-t my-2"></div>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Login</Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-gray-50 rounded">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
