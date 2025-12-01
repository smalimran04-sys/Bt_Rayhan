"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore, MenuItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Utensils, 
  Coffee, 
  Cookie, 
  GlassWater
} from 'lucide-react';
import Image from 'next/image';
import ProfessionalHeader from '@/components/ProfessionalHeader';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);

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
      
      {/* Main Content */}
      <main className="professional-container py-8">
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
              {/* Menu Items */}
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedCategory === 'all' ? 'Menu' : categories.find(c => c.name === selectedCategory)?.label}
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
    </div>
  );
}