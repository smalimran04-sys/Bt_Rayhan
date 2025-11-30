"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, ShoppingCart, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore, useCartStore, MenuItem } from '@/lib/store';
import ProfessionalHeader from '@/components/ProfessionalHeader';

export default function ScannerPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Parse QR code - expecting format: "MENU_ITEM_ID:123"
          const match = decodedText.match(/MENU_ITEM_ID:(\d+)/);
          if (match) {
            const itemId = parseInt(match[1]);
            await fetchMenuItem(itemId);
            stopScanning();
          }
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      setError('Failed to start camera. Please allow camera permissions.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop QR scanner:', err);
      }
    }
  };

  const fetchMenuItem = async (menuItemId: number) => {
    try {
      const response = await fetch(`/api/menu/${menuItemId}`);
      const item = await response.json();
      if (item) {
        setScannedItem(item);
      } else {
        setError('Item not found');
      }
    } catch (error) {
      console.error('Failed to fetch menu item:', error);
      setError('Failed to load item details');
    }
  };

  const handleLoginAndOrder = () => {
    if (scannedItem) {
      // Store the item ID to add after login
      localStorage.setItem('pendingOrderItem', JSON.stringify(scannedItem));
      router.push('/login?redirect=/dashboard');
    }
  };

  const handleAddToCart = () => {
    if (user && scannedItem) {
      addItem(scannedItem);
      router.push('/cart');
    }
  };

  const handleScanAgain = () => {
    setScannedItem(null);
    setError('');
    startScanning();
  };

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
      <ProfessionalHeader title="QR Scanner" showBackButton={true} />

      <div className="professional-container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-11-27-at-12.35.02_a1538e45-1764500105423.jpg"
                  alt="BAUST Tea Bar"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary">QR Code Scanner</h1>
            <p className="text-muted-foreground">Scan menu item QR codes to view details</p>
          </div>

          {/* Scanned Item Display */}
          {scannedItem ? (
            <Card className="professional-card overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src={getItemImage(scannedItem)}
                  alt={scannedItem.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  {scannedItem.category}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{scannedItem.name}</CardTitle>
                <CardDescription>{scannedItem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">৳{scannedItem.price}</span>
                  {scannedItem.available ? (
                    <Badge variant="outline" className="text-primary border-primary">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Unavailable
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {user ? (
                  <Button 
                    className="w-full rounded-full bg-primary hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={!scannedItem.available}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart & Continue
                  </Button>
                ) : (
                  <Button 
                    className="w-full rounded-full bg-primary hover:bg-primary/90"
                    onClick={handleLoginAndOrder}
                    disabled={!scannedItem.available}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login to Order
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={handleScanAgain}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Scan Another Item
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {/* QR Scanner */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Camera Scanner
                  </CardTitle>
                  <CardDescription>
                    Point your camera at a menu item QR code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
                  {error && (
                    <p className="text-destructive text-sm mt-2">{error}</p>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="professional-card bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-primary font-medium">
                      🍵 Welcome to BAUST Tea Bar QR Scanner
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No login required to scan and view items. Login only when you're ready to order!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}