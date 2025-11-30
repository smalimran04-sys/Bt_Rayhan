"use client";

import { useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Package, 
  Calendar,
  QrCode
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfessionalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCartButton?: boolean;
}

export default function ProfessionalHeader({ 
  title = "BAUST Tea Bar", 
  showBackButton = false,
  showCartButton = true
}: ProfessionalHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className={`professional-header transition-all duration-300 ${scrolled ? 'shadow-md py-2' : 'py-3'}`}>
      <div className="professional-container flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-11-27-at-12.35.02_a1538e45-1764500105423.jpg"
                  alt="BAUST Tea Bar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
                {user && (
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user.name}
                  </p>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {user.role === 'customer' ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Home className="h-4 w-4 mr-2" />
                        Menu
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button variant="ghost" size="sm" className="rounded-full relative">
                        <ShoppingCart className="h-4 w-4" />
                        {getTotalItems() > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                            {getTotalItems()}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Orders
                      </Button>
                    </Link>
                    <Link href="/scanner">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                <Link href={user.role === 'admin' ? '/admin/profile' : '/profile'}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden rounded-full"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="professional-container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-11-27-at-12.35.02_a1538e45-1764500105423.jpg"
                alt="BAUST Tea Bar"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-xl font-bold">BAUST Tea Bar</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="px-4 py-6 space-y-4">
            {user?.role === 'customer' ? (
              <>
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <Home className="h-5 w-5 mr-3" />
                    Menu
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6 relative">
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    Cart
                    {getTotalItems() > 0 && (
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/orders" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <Calendar className="h-5 w-5 mr-3" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/scanner" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <QrCode className="h-5 w-5 mr-3" />
                    QR Scanner
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Button>
                </Link>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <Link href="/admin" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <Home className="h-5 w-5 mr-3" />
                    Admin Dashboard
                  </Button>
                </Link>
                <Link href="/admin/profile" className="block">
                  <Button variant="ghost" className="w-full justify-start rounded-xl py-6">
                    <User className="h-5 w-5 mr-3" />
                    Admin Profile
                  </Button>
                </Link>
              </>
            ) : null}
            
            {user ? (
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl py-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            ) : (
              <div className="space-y-3 pt-4">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full rounded-xl py-6">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}