"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore, MenuItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, QrCode, LogOut, Calendar, User, Search } from 'lucide-react';
import Image from 'next/image';
import { QRScanner } from '@/components/QRScanner';
import Link from 'next/link';
import ProfessionalHeader from '@/components/ProfessionalHeader';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addItem = useCartStore((state) => state.addItem);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    fetchMenuItems();
  }, [user, router]);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/menu?available=true');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
  };

  const handleQRScan = async (menuItemId: number) => {
    try {
      const response = await fetch(`/api/menu/${menuItemId}`);
      const item = await response.json();
      if (item && item.available) {
        addItem(item);
      }
    } catch (error) {
      console.error('Failed to add scanned item:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemImage = (item: MenuItem) => {
    if (item.imageUrl) return item.imageUrl;
    
    // Default images based on category
    const categoryImages: Record<string, string> = {
      snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      beverages: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      sweets: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400',
    };
    
    return categoryImages[item.category] || categoryImages.snacks;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader title="Dashboard" />
      
      <main className="professional-container py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="professional-card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
                <p className="text-muted-foreground">
                  Ready to order your favorite snacks and beverages?
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowQRScanner(true)}
                  className="rounded-full"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
                <Link href="/cart">
                  <Button className="rounded-full relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-primary-foreground text-primary text-xs font-bold rounded-full">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-6">
          <div className="professional-card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="mb-6">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="rounded-full px-4">All Items</TabsTrigger>
              <TabsTrigger value="snacks" className="rounded-full px-4">Snacks</TabsTrigger>
              <TabsTrigger value="beverages" className="rounded-full px-4">Beverages</TabsTrigger>
              <TabsTrigger value="sweets" className="rounded-full px-4">Sweets</TabsTrigger>
            </TabsList>

            {/* Menu Items */}
            <section>
              <TabsContent value={selectedCategory} className="mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="professional-card animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="professional-card overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 w-full">
                          <Image
                            src={getItemImage(item)}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <Badge className="absolute top-4 right-4 bg-primary">
                            {item.category}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">৳{item.price}</span>
                          <Button 
                            size="sm"
                            className="rounded-full bg-primary hover:bg-primary/90"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
                
                {!isLoading && filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No items found in this category</p>
                  </div>
                )}
              </TabsContent>
            </section>
          </Tabs>
        </section>
      </main>

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}