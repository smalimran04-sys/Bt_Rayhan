"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import ProfessionalHeader from '@/components/ProfessionalHeader';

interface Order {
  id: number;
  orderType: string;
  scheduledDate: string | null;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  department: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user!.id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate estimated time based on order type and status
  const getEstimatedTime = (order: Order) => {
    // If order is already delivered or cancelled, no estimated time
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return null;
    }
    
    // If order is ready, it's ready now
    if (order.orderStatus === 'ready') {
      return new Date();
    }
    
    // Base preparation time
    let baseMinutes = 15;
    
    // Add time based on order type
    if (order.orderType === 'scheduled') {
      baseMinutes += 10; // Scheduled orders take longer to prepare
    }
    
    // Adjust time based on order status
    const statusMultipliers: Record<string, number> = {
      pending: 1.0,
      confirmed: 0.7,
      preparing: 0.3,
      ready: 0,
    };
    
    const multiplier = statusMultipliers[order.orderStatus] || 1.0;
    baseMinutes *= multiplier;
    
    const orderDate = new Date(order.createdAt);
    const estimatedTime = new Date(orderDate.getTime() + baseMinutes * 60000);
    return estimatedTime;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-purple-500',
      ready: 'bg-green-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader title="My Orders" showBackButton={true} />
      
      <main className="professional-container py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="professional-card animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="professional-card text-center py-12">
              <CardContent className="space-y-4">
                <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">No orders yet</h2>
                <p className="text-muted-foreground">Start ordering from our delicious menu!</p>
                <Link href="/dashboard">
                  <Button className="rounded-full bg-primary hover:bg-primary/90">
                    Browse Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const estimatedTime = getEstimatedTime(order);
                return (
                  <Link key={order.id} href={`/order-confirmation/${order.id}`}>
                    <Card className="professional-card hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), 'PPP p')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{order.orderType}</span>
                        </div>
                        {order.scheduledDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Scheduled For</span>
                            <span className="font-medium">
                              {format(new Date(order.scheduledDate), 'PP')}
                            </span>
                          </div>
                        )}
                        {estimatedTime && ['pending', 'confirmed', 'preparing'].includes(order.orderStatus) && (
                          <div className="flex items-center justify-between text-sm p-2 bg-primary/5 rounded">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">Ready by</span>
                            </div>
                            <span className="font-medium">
                              {format(estimatedTime, 'h:mm a')}
                              <span className="text-muted-foreground text-xs ml-1">
                                (~{Math.round((estimatedTime.getTime() - new Date().getTime()) / 60000)} min)
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment</span>
                          <span className="font-medium uppercase">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-primary">৳{order.totalAmount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}