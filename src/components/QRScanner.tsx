"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (menuItemId: number) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

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
        (decodedText) => {
          // Parse QR code - expecting format: "MENU_ITEM_ID:123"
          const match = decodedText.match(/MENU_ITEM_ID:(\d+)/);
          if (match) {
            const itemId = parseInt(match[1]);
            onScan(itemId);
            stopScanning();
            onClose();
          }
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
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

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at the menu item QR code
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
          <Button onClick={handleClose} variant="outline" className="w-full">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
