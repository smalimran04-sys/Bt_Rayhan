"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProfessionalHeader from '@/components/ProfessionalHeader';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [orderType, setOrderType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Profile completion fields
  const [profileData, setProfileData] = useState({
    name: '',
    designation: '',
    department: '',
    phone: '',
    email: '',
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    
    // Check for missing profile fields
    const missing: string[] = [];
    const data = {
      name: user.name || '',
      designation: user.designation || '',
      department: user.department || '',
      phone: user.phone || '',
      email: user.email || '',
    };
    
    if (!data.name) missing.push('name');
    if (!data.designation) missing.push('designation');
    if (!data.department) missing.push('department');
    if (!data.phone) missing.push('phone');
    if (!data.email) missing.push('email');
    
    console.log('User data:', user);
    console.log('Profile data:', data);
    console.log('Missing fields:', missing);
    
    setMissingFields(missing);
    setProfileData(data);
  }, [user, items, router]);

  const handleUpdateProfile = async () => {
    // Validate all required fields are filled
    if (!profileData.name || !profileData.designation || !profileData.department || 
        !profileData.phone || !profileData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users/${user!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setMissingFields([]);
      toast.success('Profile updated successfully!', {
        description: 'You can now proceed with your order',
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile', {
        description: err.message,
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Check if profile is complete
    if (missingFields.length > 0) {
      setError('Please complete your profile information before placing an order');
      return;
    }

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
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Completion Form */}
          {missingFields.length > 0 && (
            <Card className="professional-card border-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  Complete Your Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please fill in the missing information to proceed with checkout
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={missingFields.includes('name') ? 'border-amber-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={profileData.designation}
                    onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                    placeholder="e.g., Student, Professor, Staff"
                    className={missingFields.includes('designation') ? 'border-amber-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    placeholder="Enter your department"
                    className={missingFields.includes('department') ? 'border-amber-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="e.g., 01712345678"
                    className={missingFields.includes('phone') ? 'border-amber-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                    className={missingFields.includes('email') ? 'border-amber-500' : ''}
                    disabled
                  />
                </div>

                <Button 
                  className="w-full rounded-full bg-amber-600 hover:bg-amber-700"
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Update Profile & Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Customer Details Summary - Only show if profile is complete */}
          {missingFields.length === 0 && (
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-medium text-sm">{user.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Designation</span>
                    <span className="font-medium">{user.designation}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="font-medium">{user.department}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                </div>
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
            disabled={isLoading || missingFields.length > 0}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {missingFields.length > 0 ? 'Complete Profile to Continue' : 'Place Order'}
          </Button>
        </div>
      </main>
    </div>
  );
}