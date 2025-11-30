"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ProfessionalHeader from '@/components/ProfessionalHeader';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [orderType, setOrderType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [user, items, router]);

  const handlePlaceOrder = async () => {
    if (orderType === 'scheduled' && !scheduledDate) {
      setError('Please select a delivery date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          orderType,
          scheduledDate: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : null,
          paymentMethod,
          department: user!.department,
          items: items.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Create payment record
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
          amount: getTotalPrice(),
          paymentMethod,
          transactionId: `TXN${Date.now()}`,
          paymentStatus: 'completed',
        }),
      });

      // Clear cart and redirect
      clearCart();
      router.push(`/order-confirmation/${orderData.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader title="Checkout" showBackButton={true} />
      
      <main className="professional-container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {error && (
            <Card className="professional-card border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Type */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">Instant Order</p>
                      <p className="text-sm text-muted-foreground">Get your order as soon as possible</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">Schedule for Later</p>
                      <p className="text-sm text-muted-foreground">Choose a date for delivery</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {orderType === 'scheduled' && (
                <div className="mt-4">
                  <Label>Select Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal rounded-lg mt-2',
                          !scheduledDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Department</span>
                <span className="font-semibold">{user.department}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span>{item.menuItem.name} × {item.quantity}</span>
                  <span>৳{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">৳{getTotalPrice()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button 
            className="w-full rounded-full bg-primary hover:bg-primary/90 py-6 text-lg"
            onClick={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Place Order
          </Button>
        </div>
      </main>
    </div>
  );
}