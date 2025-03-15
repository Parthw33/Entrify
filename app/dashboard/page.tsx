"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  History,
  LogOut,
  X,
  Upload,
  Camera,
  Search,
  User,
  CheckCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import ScannedDataDisplay from "./components/ScannedDataDisplay";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  anuBandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string; // ISO date format
  birthTime: string;
  birthPlace: string;
  education: string;
  photo: string; // URL of the photo
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  approvalStatus: boolean;
}

export default function Dashboard() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "image">("camera");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize the scanner
    const html5QrCode = new Html5Qrcode("qr-reader");
    setScanner(html5QrCode);

    async function checkCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setCameraPermission(true);
        stream.getTracks().forEach((track) => track.stop());

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Prefer back camera if available
          const backCamera =
            devices.find((device) =>
              device.label.toLowerCase().includes("back")
            ) || devices[0];
          setCameraId(backCamera.id);
        }
      } catch (err) {
        setCameraPermission(false);
        console.error("Camera permission denied:", err);
      }
    }

    checkCameraPermission();

    return () => {
      if (scanner && scanner.isScanning) {
        scanner
          .stop()
          .then(() => {
            console.log("Camera stopped on component unmount");
          })
          .catch((err) => {
            console.error("Error stopping camera on unmount:", err);
          });
      }
    };
  }, []);

  const startCameraScanning = async () => {
    if (!scanner || !cameraId) return;

    setScanMode("camera");

    try {
      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code successfully scanned
          setScanResult(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          console.error("QR scan error:", errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const stopScanning = async () => {
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
        setIsScanning(false);
        console.log("Camera stopped successfully");
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!scanner || !event.target.files || event.target.files.length === 0) {
      return;
    }

    setScanMode("image");
    const imageFile = event.target.files[0];

    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // First make sure we're not scanning
    if (scanner.isScanning) {
      scanner.stop().then(() => {
        scanQRFromImage(imageFile);
      });
    } else {
      scanQRFromImage(imageFile);
    }
  };

  const scanQRFromImage = (imageFile: File) => {
    if (!scanner) return;

    // Display a preview of the image
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (e.target?.result) {
        const previewElement = document.getElementById("qr-reader");
        if (previewElement) {
          previewElement.innerHTML = `
            <div class="relative w-full max-w-md mx-auto">
              <img src="${e.target.result}" alt="QR Code" class="mx-auto max-h-64 object-contain" />
              <div class="mt-2 text-center text-sm text-gray-500">Scanning image...</div>
            </div>
          `;
        }
      }
    };
    fileReader.readAsDataURL(imageFile);

    // Decode the QR code from the image
    scanner
      .scanFile(imageFile, /* showImage= */ false)
      .then((decodedText: string) => {
        console.log("QR Code from image:", decodedText);
        setScanResult(decodedText);
      })
      .catch((err: string) => {
        console.error("Error scanning QR code from image:", err);
        // Show error message to user
        const previewElement = document.getElementById("qr-reader");
        if (previewElement) {
          previewElement.innerHTML += `
            <div class="mt-2 text-center text-red-500">
              No QR code found in image. Please try another image.
            </div>
          `;
        }
      });
  };

  const prepareImageUploadUI = () => {
    // Reset the scanner display for image upload
    const readerElement = document.getElementById("qr-reader");
    if (readerElement) {
      readerElement.innerHTML = `
        <div class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p class="mb-4 text-gray-500">Upload an image containing a QR code</p>
          <div class="flex gap-2">
            <button id="upload-button" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <span class="mr-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></span>
              Select Image
            </button>
          </div>
        </div>
      `;

      // Add event listener to the newly created button
      const uploadButton = document.getElementById("upload-button");
      if (uploadButton) {
        uploadButton.addEventListener("click", () => {
          fileInputRef.current?.click();
        });
      }
    }
  };

  const handleRestartScanning = () => {
    setScanResult(null);
    if (scanMode === "camera") {
      startCameraScanning();
    } else {
      prepareImageUploadUI();
    }
  };

  const handleScanModeChange = async (mode: "camera" | "image") => {
    if (mode === scanMode) {
      // If we're already in image mode, just trigger file selection
      if (mode === "image") {
        fileInputRef.current?.click();
      } else if (mode === "camera" && !isScanning) {
        // If in camera mode but not scanning, start scanning
        startCameraScanning();
      }
      return;
    }

    // Stop scanning if already scanning
    if (scanner && scanner.isScanning) {
      await stopScanning();
    }

    // Clear the reader container
    const readerElement = document.getElementById("qr-reader");
    if (readerElement) {
      readerElement.innerHTML = "";
    }

    setScanMode(mode);

    // Setup UI based on new mode
    if (mode === "camera") {
      startCameraScanning();
    } else {
      prepareImageUploadUI();
    }
  };

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [anubandhId, setAnubandhId] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [profileData, setProfileData] = useState<Profile | null>(null);

  // Improved search function with better error handling and type safety
  const handleSearchByAnubandhId = async (): Promise<void> => {
    if (!anubandhId.trim()) {
      setSearchError("Please enter an Anubandh ID");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setProfileData(null);

    try {
      const response = await fetch(
        `/api/profiles?id=${encodeURIComponent(anubandhId.trim())}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setSearchError("No profile found with this Anubandh ID");
        return;
      }

      // Handle both array or single object responses
      const profile: Profile = Array.isArray(data) ? data[0] : data;
      setProfileData(profile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to search profile";
      setSearchError(errorMessage);
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Improved approval function with better error handling
  const handleApproveProfile = async (): Promise<void> => {
    if (!profileData) {
      setSearchError("No profile selected for approval");
      return;
    }

    if (profileData.approvalStatus) {
      setSearchError("Profile is already approved");
      return;
    }

    try {
      const response = await fetch("/api/profiles/userApproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: profileData.anuBandhId,
          approvalStatus: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to approve: ${response.status}`
        );
      }

      // Update local state to reflect the approval
      setProfileData({
        ...profileData,
        approvalStatus: true,
      });

      // Show success message (could be replaced with a toast notification)
      alert("Profile approved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve profile";
      setSearchError(errorMessage);
      console.error("Approval error:", error);
    }
  };

  // console.log(searchResults.name);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="scanner">
            <QrCode className="mr-2 h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            By Anubandh
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameraPermission === false && scanMode === "camera" ? (
                <p className="text-red-500 text-center">
                  Camera permission is required to scan QR codes.
                </p>
              ) : scanResult ? (
                <ScannedDataDisplay
                  scanResult={scanResult}
                  onReset={() => handleRestartScanning()}
                />
              ) : (
                <>
                  {/* Scan Mode Selection */}
                  <div className="flex justify-center mb-4 gap-4">
                    <Button
                      variant={scanMode === "camera" ? "default" : "outline"}
                      onClick={() => handleScanModeChange("camera")}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button
                      variant={scanMode === "image" ? "default" : "outline"}
                      onClick={() => handleScanModeChange("image")}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Image
                    </Button>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div id="qr-reader" className="w-full max-w-md mx-auto" />

                  <div className="flex justify-center mt-4">
                    {scanMode === "camera" && (
                      <>
                        {isScanning ? (
                          <Button
                            variant="destructive"
                            onClick={stopScanning}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Stop Scanning
                          </Button>
                        ) : (
                          <Button
                            onClick={startCameraScanning}
                            className="flex items-center gap-2"
                          >
                            <QrCode className="h-4 w-4" />
                            Start Scanning
                          </Button>
                        )}
                      </>
                    )}

                    {scanMode === "image" && !isScanning && (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Select Image
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Anubandh Profile Verification
                  </CardTitle>
                  <CardDescription>
                    Search and approve profiles by Anubandh ID
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                >
                  Admin Panel
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Anubandh ID"
                    value={anubandhId}
                    onChange={(e) => setAnubandhId(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchByAnubandhId()
                    }
                  />
                </div>
                <Button
                  onClick={handleSearchByAnubandhId}
                  disabled={isSearching || !anubandhId.trim()}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {profileData && (
                <Card className="mt-6 border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Profile Details</CardTitle>
                      <Badge
                        variant={
                          profileData.approvalStatus ? "secondary" : "outline"
                        }
                        className={
                          profileData.approvalStatus
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                        }
                      >
                        {profileData.approvalStatus
                          ? "Approved"
                          : "Pending Approval"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center">
                        {profileData.photo ? (
                          <Avatar className="h-32 w-32 border-2 border-slate-200">
                            <AvatarImage
                              src={profileData.photo}
                              alt={`Photo of ${profileData.name}`}
                            />
                            <AvatarFallback>
                              {profileData.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-32 w-32 border-2 border-slate-200">
                            <AvatarFallback>
                              <User size={32} />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{profileData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{profileData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Mobile
                          </p>
                          <p className="font-medium">
                            {profileData.mobileNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Date of Birth
                          </p>
                          <p className="font-medium">
                            {profileData.dateOfBirth}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Birth Time
                          </p>
                          <p className="font-medium">{profileData.birthTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Birth Place
                          </p>
                          <p className="font-medium">
                            {profileData.birthPlace}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Education
                          </p>
                          <p className="font-medium">{profileData.education}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {!profileData.approvalStatus && (
                    <CardFooter className="flex justify-end pt-2 pb-4">
                      <Button
                        onClick={handleApproveProfile}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Profile
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View statistics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports dashboard will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
