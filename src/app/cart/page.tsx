"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ProfessionalHeader from '@/components/ProfessionalHeader';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader title="Shopping Cart" showBackButton={true} />
      
      <main className="professional-container py-8">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <Card className="professional-card text-center py-12">
              <CardContent className="space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground">Add some delicious items from our menu!</p>
                <Link href="/dashboard">
                  <Button className="rounded-full bg-primary hover:bg-primary/90">
                    Browse Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.menuItem.id} className="professional-card">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                          <Image
                            src={item.menuItem.imageUrl || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400'}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.menuItem.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.menuItem.description}
                          </p>
                          <p className="text-lg font-bold text-primary mt-1">
                            ৳{item.menuItem.price}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              removeItem(item.menuItem.id);
                              toast.error(`${item.menuItem.name} removed from cart`, {
                                duration: 2000,
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                updateQuantity(item.menuItem.id, newQty);
                                if (newQty === 0) {
                                  toast.error(`${item.menuItem.name} removed from cart`, {
                                    duration: 2000,
                                  });
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <Card className="professional-card sticky bottom-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>৳{getTotalPrice()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">৳{getTotalPrice()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full rounded-full bg-primary hover:bg-primary/90" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}