"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Home, Receipt, Clock } from 'lucide-react';
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

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    description: string;
  };
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [user, router, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setOrder(data.order);
      setOrderItems(data.orderItems);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate estimated time based on order type and items
  const getEstimatedTime = () => {
    if (!order) return null;
    
    // Base preparation time
    let baseMinutes = 15;
    
    // Add time based on order type
    if (order.orderType === 'scheduled') {
      baseMinutes += 10; // Scheduled orders take longer to prepare
    }
    
    // Add time based on number of items
    const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0);
    baseMinutes += Math.min(itemCount * 2, 20); // Max 20 additional minutes
    
    // Add time for complex items (simplified logic)
    const hasComplexItems = orderItems.some(item => 
      item.menuItem.name.toLowerCase().includes('special') || 
      item.menuItem.name.toLowerCase().includes('combo')
    );
    if (hasComplexItems) {
      baseMinutes += 10;
    }
    
    const now = new Date();
    const readyTime = new Date(now.getTime() + baseMinutes * 60000);
    return readyTime;
  };

  const estimatedTime = getEstimatedTime();

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader title="Order Confirmed" showBackButton={true} />
      
      <main className="professional-container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="professional-card text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-primary" />
              </div>
              <CardTitle className="text-3xl text-primary">Order Placed Successfully!</CardTitle>
              <p className="text-muted-foreground">
                Your order has been received and is being processed
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6 text-left">
              {order && (
                <>
                  {/* Estimated Time Section */}
                  {estimatedTime && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-primary">Estimated Ready Time</h3>
                      </div>
                      <p className="text-lg font-bold">
                        {format(estimatedTime, 'h:mm a')} 
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (~{Math.round((estimatedTime.getTime() - new Date().getTime()) / 60000)} minutes)
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your order will be ready for pickup at the BAUST Tea Bar counter
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order ID</span>
                      <span className="font-semibold">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order Type</span>
                      <Badge variant={order.orderType === 'instant' ? 'default' : 'secondary'}>
                        {order.orderType}
                      </Badge>
                    </div>
                    {order.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Scheduled For</span>
                        <span className="font-semibold">
                          {format(new Date(order.scheduledDate), 'PPP')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Method</span>
                      <span className="font-semibold uppercase">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="font-semibold">{order.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order Date</span>
                      <span className="font-semibold">
                        {format(new Date(order.createdAt), 'PPP p')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.menuItem.name} × {item.quantity}</span>
                          <span>৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between font-bold text-xl">
                    <span>Total Paid</span>
                    <span className="text-primary">৳{order.totalAmount}</span>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="w-full">
                <Button variant="outline" className="w-full rounded-full">
                  <Receipt className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Menu
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}