"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore, MenuItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  Utensils, 
  Coffee, 
  Cookie, 
  GlassWater,
  ChevronRight,
  Clock,
  QrCode
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ProfessionalHeader from '@/components/ProfessionalHeader';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMenuItems();
  }, []);

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
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Prevent admins from adding to cart
    if (user.role === 'admin') {
      toast.error('Admin cannot place orders', {
        description: 'Please use a customer account to order',
        duration: 3000,
      });
      return;
    }
    
    addItem(item);
    toast.success('Added to cart!', {
      description: `${item.name} - ৳${item.price}`,
      duration: 3000,
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredItems = filteredItems.filter(item => item.category === 'beverages').slice(0, 5);
  
  const categories = [
    { name: 'all', label: 'All Items', icon: Utensils },
    { name: 'beverages', label: 'Beverages', icon: Coffee },
    { name: 'snacks', label: 'Snacks', icon: Cookie },
    { name: 'sweets', label: 'Desserts', icon: GlassWater },
  ];

  const getItemImage = (item: MenuItem) => {
    if (item.imageUrl) return item.imageUrl;

    const categoryImages: Record<string, string> = {
      snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      beverages: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      sweets: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400',
    };

    return categoryImages[item.category] || categoryImages.snacks;
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="professional-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Freshly Brewed <span className="text-primary">Delights</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-lg">
                Experience the finest teas, snacks, and desserts prepared fresh daily on the BAUST campus.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="rounded-full bg-primary hover:bg-primary/90 px-8"
                  onClick={() => router.push(user ? '/dashboard' : '/login')}
                >
                  Order Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8"
                  onClick={() => router.push('/scanner')}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Scan QR
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600"
                  alt="BAUST Tea Bar"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-bold">4.9</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Customer Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="professional-section">
        <div className="professional-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="professional-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Schedule Orders</h3>
              <p className="text-muted-foreground text-sm">
                Plan your meals ahead for any day of the week with our flexible scheduling system.
              </p>
            </div>
            
            <div className="professional-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Ordering</h3>
              <p className="text-muted-foreground text-sm">
                Fast service with QR code scanning and one-click ordering for busy students.
              </p>
            </div>
            
            <div className="professional-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground text-sm">
                Fresh ingredients and consistent taste with our quality assurance program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="professional-section">
        <div className="professional-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="professional-card p-6 sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.name}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.name
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <IconComponent size={18} />
                        <span>{category.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-4">Search Menu</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-3">
              {/* Featured Items */}
              {featuredItems.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Popular Beverages</h2>
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:text-primary"
                      onClick={() => setSelectedCategory('beverages')}
                    >
                      View All
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredItems.map((item) => (
                      <Card key={item.id} className="professional-card overflow-hidden">
                        <div className="relative h-48">
                          <Image
                            src={getItemImage(item)}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star size={14} className="text-amber-500 fill-current" />
                            <span className="text-xs font-bold">4.8</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <Badge className="bg-primary/10 text-primary">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">৳{item.price}</span>
                            {user?.role === 'admin' ? (
                              <Button
                                className="rounded-full"
                                variant="outline"
                                disabled
                              >
                                Admin View
                              </Button>
                            ) : (
                              <Button
                                className="rounded-full bg-primary hover:bg-primary/90"
                                onClick={() => handleAddToCart(item)}
                              >
                                <Plus size={16} className="mr-2" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* All Menu Items */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedCategory === 'all' ? 'Full Menu' : categories.find(c => c.name === selectedCategory)?.label}
                    <span className="text-muted-foreground text-lg font-normal ml-2">({filteredItems.length})</span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="professional-card p-5 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-muted rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                            <div className="h-6 bg-muted rounded w-1/3"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className={`professional-card p-5 transition-all ${user?.role === 'admin' ? '' : 'cursor-pointer hover:shadow-md'}`}
                        onClick={() => user?.role !== 'admin' && handleAddToCart(item)}
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                            <Image
                              src={getItemImage(item)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold">{item.name}</h3>
                              <Badge className="bg-primary/10 text-primary text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">৳{item.price}</span>
                              {user?.role === 'admin' ? (
                                <Button
                                  className="rounded-full h-9 px-4"
                                  variant="outline"
                                  disabled
                                >
                                  Admin
                                </Button>
                              ) : (
                                <Button
                                  className="rounded-full bg-primary hover:bg-primary/90 h-9 px-4"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(item);
                                  }}
                                >
                                  <Plus size={16} className="mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Utensils className="text-muted-foreground" size={24} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No items found</h3>
                    <p className="text-muted-foreground mb-4">Try selecting a different category</p>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => setSelectedCategory('all')}
                    >
                      View All Menu
                    </Button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t">
        <div className="professional-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-11-27-at-12.35.02_a1538e45-1764500105423.jpg"
                    alt="BAUST Tea Bar"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
                <span className="text-xl font-bold">BAUST Tea Bar</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Providing quality beverages and snacks to the BAUST community since 2020.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Menu</Link></li>
                <li><Link href="/orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
                <li><Link href="/scanner" className="hover:text-foreground transition-colors">QR Scanner</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Dine In</li>
                <li>Takeaway</li>
                <li>Delivery</li>
                <li>Catering</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>BAUST Campus, Saidpur</li>
                <li>+880 1234 567890</li>
                <li>info@baustteabar.com</li>
                <li>Open: 8AM - 10PM Daily</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} BAUST Tea Bar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}