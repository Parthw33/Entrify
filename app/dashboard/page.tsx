"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, History } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import ScannedDataDisplay from "./components/ScannedDataDisplay";

export default function Dashboard() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      scanner.clear();
    };
  }, []);

  const mockHistory = [
    { id: 1, content: "https://example.com/1", timestamp: "2024-03-20 10:30" },
    { id: 2, content: "Product-123-456", timestamp: "2024-03-20 09:15" },
    { id: 3, content: "Invoice-789", timestamp: "2024-03-19 15:45" },
  ];

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="scanner">
            <QrCode className="mr-2 h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="qr-reader" className="w-full max-w-md mx-auto" />
              {scanResult ? (
                <ScannedDataDisplay
                  scanResult={scanResult}
                  onReset={() => setScanResult(null)}
                />
              ) : (
                <div id="qr-reader" className="w-full max-w-md mx-auto" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.content}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.timestamp}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
