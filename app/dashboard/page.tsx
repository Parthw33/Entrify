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
  UserSearch,
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
import UserTable from "../admin/components/allUserTable";
import UsersTableWithSkeleton from "../admin/components/usersTableWithSkeleton";
import { getProfile } from "@/app/actions/getProfile";
import { approveUser } from "@/app/actions/approveUser";
import { updateApprovalStatus } from "@/app/actions/updateApprovalStatus";
import type { Profile } from "@/app/actions/getProfile";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import jsQR from "jsqr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const [activeTab, setActiveTab] = useState("scanner");

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [anubandhId, setAnubandhId] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [introductionChecked, setIntroductionChecked] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Add a state for available cameras
  const [availableCameras, setAvailableCameras] = useState<
    { id: string; label: string }[]
  >([]);

  // Add isAdmin and isUser variables for role-based permission checks
  const { data: session, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Check for default role and redirect to home
  useEffect(() => {
    if (!session && status !== "loading") {
      // Redirect if not authenticated
      toast.error("Please login to access this page");
      router.push("/");
      return;
    }

    // Only block the default role, allow readOnly to view
    if (status === "authenticated" && session?.user?.role === "default") {
      toast.error("You don't have permission to access this page.");
      router.push("/");
    }
  }, [status, session, router]);

  // Define role-based permission checks
  const isAdmin = session?.user?.role === "admin";
  const isUser = session?.user?.role === "user";
  const isReadOnly = session?.user?.role === "readOnly";
  console.log("Session ", session?.user?.role);
  const canApprove = isAdmin || isUser; // ReadOnly can't approve

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
          setAvailableCameras(devices);
          console.log("Available cameras:", devices);

          // Priority-based camera selection
          // 1. First try to find camera with ID "0" (often the back camera on Android)
          // 2. Then look for cameras with common back camera keywords in their labels
          let selectedCamera = null;

          // Try to find a camera with ID "0"
          selectedCamera = devices.find((device) => device.id === "0");

          // if (!selectedCamera) {
          // // Try to find a camera with back camera keywords in order of priority
          // const backCameraKeywords = [
          //   "back camera",
          //   "facing back",
          //   "camera2",
          //   "environment",
          //   "rear",
          // ];

          // for (const keyword of backCameraKeywords) {
          //   selectedCamera = devices.find((device) =>
          //     device.label.toLowerCase().includes(keyword)
          //   );
          //   if (selectedCamera) {
          //     console.log(
          //       `Selected camera with keyword "${keyword}":`,
          //       selectedCamera
          //     );
          //     break;
          //   }
          // }

          // If still no match, try any camera with "back" in the name
          if (!selectedCamera) {
            selectedCamera = devices.find((device) =>
              device.label.toLowerCase().includes("back")
            );
          }

          // Default to first camera if no back camera found
          if (!selectedCamera) {
            selectedCamera = devices[0];
            console.log(
              "No back camera found, using first camera:",
              selectedCamera
            );
          } else {
            console.log("Selected camera:", selectedCamera);
          }

          setCameraId(selectedCamera.id);
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

  // Improved QR code processing function
  const processQRResult = (decodedText: string) => {
    console.log("Raw QR result:", decodedText);
    let anubandhId = null;

    try {
      // Check if the text looks like JSON by checking for curly braces
      if (
        decodedText.trim().startsWith("{") &&
        decodedText.trim().endsWith("}")
      ) {
        // Try to parse as JSON
        const data = JSON.parse(decodedText);
        console.log("Parsed QR data:", data);

        // Extract ID using various possible field names
        anubandhId = data.id || data.anubandhId || data.anubandh_id;

        if (anubandhId) {
          console.log("Found anubandhId in JSON:", anubandhId);
          setScanResult(decodedText);
          return;
        }
      }

      // If it's not valid JSON or doesn't contain ID field, check if it's a direct ID
      if (
        typeof decodedText === "string" &&
        decodedText.trim() &&
        /^[A-Za-z0-9_-]{3,}$/.test(decodedText.trim())
      ) {
        console.log("Using raw string as anubandhId:", decodedText.trim());

        // Wrap the plain ID in JSON for consistency with the ScannedDataDisplay component
        const wrappedData = JSON.stringify({ id: decodedText.trim() });
        setScanResult(wrappedData);
        return;
      }

      // Fallback - just use the raw data
      console.log("Using raw QR data");
      setScanResult(decodedText);
    } catch (error) {
      console.error("Error processing QR code:", error);
      setScanResult(decodedText); // Still set the result even if processing fails
    }
  };

  const scanQRCode = () => {
    if (!scanner) return;

    const video = document.querySelector("video");
    if (!video) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Process with jsQR
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // Try both light-on-dark and dark-on-light QR codes
      });

      if (code) {
        console.log("QR code detected:", code.data);
        processQRResult(code.data);
        stopScanning();
      }
    } catch (error) {
      console.error("Error in jsQR:", error);
    }
  };

  const startCameraScanning = async () => {
    if (!scanner || !cameraId) return;

    setScanMode("camera");

    try {
      console.log("Starting camera with ID:", cameraId);

      // First clear the qr-reader container
      const readerElement = document.getElementById("qr-reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }

      // Use basic configuration options that are supported
      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code successfully scanned - process the result
          processQRResult(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          console.error("QR scan error:", errorMessage);
        }
      );
      setIsScanning(true);

      // Add corner markers manually after scanner is initialized
      setTimeout(() => {
        const scanRegion = document.querySelector("#qr-reader .qr-region");
        if (scanRegion) {
          // Remove existing border if any
          scanRegion.classList.add("qr-transparent-border");

          // Add corner markers
          const cornerSize = 20;
          const cornerThickness = 3;
          const corners = [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ];

          corners.forEach((corner) => {
            const cornerElement = document.createElement("div");
            cornerElement.className = `qr-corner ${corner}`;
            scanRegion.appendChild(cornerElement);
          });

          // Add CSS styles for corners
          const style = document.createElement("style");
          style.textContent = `
            .qr-transparent-border {
              border: 2px dashed transparent !important;
            }
            .qr-corner {
              position: absolute;
              width: ${cornerSize}px;
              height: ${cornerSize}px;
              border: ${cornerThickness}px solid #2563eb;
            }
            .qr-corner.top-left {
              top: -2px;
              left: -2px;
              border-right: none;
              border-bottom: none;
            }
            .qr-corner.top-right {
              top: -2px;
              right: -2px;
              border-left: none;
              border-bottom: none;
            }
            .qr-corner.bottom-left {
              bottom: -2px;
              left: -2px;
              border-right: none;
              border-top: none;
            }
            .qr-corner.bottom-right {
              bottom: -2px;
              right: -2px;
              border-left: none;
              border-top: none;
            }
          `;
          document.head.appendChild(style);
        }
      }, 500); // Wait a bit for the scanner to initialize its UI
    } catch (err) {
      console.error("Error starting camera:", err);

      // Fallback to environment facing camera if specific ID fails
      try {
        console.log("Trying environment facing camera as fallback");

        // First check if there are any other camera IDs available
        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length > 1) {
          // Try another camera that's not the current one
          const alternativeCameraId = devices.find(
            (device) => device.id !== cameraId
          )?.id;

          if (alternativeCameraId) {
            await scanner.start(
              alternativeCameraId,
              { fps: 15, qrbox: { width: 250, height: 250 } },
              (decodedText) => {
                processQRResult(decodedText);
                stopScanning();
              },
              (errorMessage) => {
                console.error("QR scan fallback error:", errorMessage);
              }
            );
            setIsScanning(true);

            // Add same corner markers for fallback camera
            setTimeout(() => {
              const scanRegion = document.querySelector(
                "#qr-reader .qr-region"
              );
              if (scanRegion) {
                scanRegion.classList.add("qr-transparent-border");

                const cornerSize = 20;
                const cornerThickness = 3;
                const corners = [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ];

                corners.forEach((corner) => {
                  const cornerElement = document.createElement("div");
                  cornerElement.className = `qr-corner ${corner}`;
                  scanRegion.appendChild(cornerElement);
                });
              }
            }, 500);
          }
        }
      } catch (fallbackErr) {
        console.error("Error with fallback camera method:", fallbackErr);
      }
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

    // Decode the QR code from the image with improved configuration
    scanner
      .scanFile(imageFile, /* showImage= */ false)
      .then((decodedText: string) => {
        console.log("QR Code from image:", decodedText);
        processQRResult(decodedText);
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
  useEffect(() => {
    // Stop camera scanning when tab changes
    if (scanner && scanner.isScanning) {
      stopScanning()
        .then(() => {
          console.log("Camera stopped due to tab change");
        })
        .catch((err) => {
          console.error("Error stopping camera on tab change:", err);
        });
    }

    // Reset states or perform refresh actions here
    setScanResult(null); // Reset scan results on tab switch
    setAnubandhId(""); // Clear Anubandh ID search
    setProfileData(null); // Reset profile data
  }, [activeTab]);

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

  // Set introduction status when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setIntroductionChecked(!!profileData.introductionStatus);
    }
  }, [profileData]);

  // Updated search function using server action
  const handleSearchByAnubandhId = async (): Promise<void> => {
    if (!anubandhId.trim()) {
      setSearchError("Please enter an Anubandh ID");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setProfileData(null);

    try {
      const profile = await getProfile(anubandhId.trim());
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

  // Updated approval function to use updateApprovalStatus instead of approveUser
  const handleApproveProfile = async (): Promise<void> => {
    if (!profileData) {
      setSearchError("No profile selected for approval");
      return;
    }

    if (profileData.approvalStatus) {
      setSearchError("Profile is already approved");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use updateApprovalStatus to include introduction status
      await updateApprovalStatus({
        anubandhId: profileData.anubandhId,
        attendeeCount: profileData.attendeeCount || 1,
        introductionStatus: introductionChecked,
      });

      // Update local state to reflect the approval and introduction status
      setProfileData({
        ...profileData,
        approvalStatus: true,
        introductionStatus: introductionChecked,
      });

      toast.success("Profile approved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve entry";
      setSearchError(errorMessage);
      toast.error(errorMessage);
      console.error("Approval error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update introduction status for already approved profiles
  const handleUpdateIntroductionStatus = async (): Promise<void> => {
    if (!profileData) {
      setSearchError("No profile selected");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateApprovalStatus({
        anubandhId: profileData.anubandhId,
        attendeeCount: profileData.attendeeCount || 1,
        introductionStatus: introductionChecked,
      });

      // Update local state
      setProfileData({
        ...profileData,
        introductionStatus: introductionChecked,
      });

      toast.success(
        introductionChecked
          ? "Introduction status set successfully"
          : "Introduction status removed successfully"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update introduction status";
      setSearchError(errorMessage);
      toast.error(errorMessage);
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // console.log(searchResults.name);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="flex justify-end mb-5">
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm h-10 px-4"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs
        defaultValue="scanner"
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 p-1 h-14">
          <TabsTrigger value="scanner" className="text-sm py-3">
            <QrCode className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Scanner</span>
            <span className="xs:hidden">Scan</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm py-3">
            <History className="mr-2 h-4 w-4" />
            Anubandh
          </TabsTrigger>
          <TabsTrigger value="mobile" className="text-sm py-3">
            <UserSearch className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Name/Mobile No.</span>
            <span className="xs:hidden">Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card>
            <CardHeader className="bg-slate-50 border-b p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">QR Scanner</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {cameraPermission === false && scanMode === "camera" ? (
                <div className="flex flex-col items-center justify-center p-6 space-y-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
                  <div className="text-center space-y-2 mb-2">
                    <p className="text-red-600 text-base font-medium">
                      Camera access is required to scan QR codes
                    </p>
                    <p className="text-gray-600 text-sm">
                      Click the button below to allow browser camera access.
                      You&apos;ll see a permission prompt from your browser.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      If you previously denied access, you may need to update
                      your browser settings.
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        // This will trigger the browser's permission prompt
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            video: true,
                          });
                        setCameraPermission(true);
                        stream.getTracks().forEach((track) => track.stop());

                        // Get available cameras after permission granted
                        const devices = await Html5Qrcode.getCameras();
                        if (devices && devices.length > 0) {
                          setAvailableCameras(devices);
                          const backCamera =
                            devices.find(
                              (device) =>
                                device.id === "0" ||
                                device.label.toLowerCase().includes("back") ||
                                device.label.toLowerCase().includes("rear") ||
                                device.label
                                  .toLowerCase()
                                  .includes("environment") ||
                                device.label
                                  .toLowerCase()
                                  .includes("facing back") ||
                                device.label.toLowerCase().includes("camera2")
                            ) || devices[0];
                          setCameraId(backCamera.id);
                          startCameraScanning();
                        }
                      } catch (err) {
                        console.error("Camera permission denied again:", err);
                        setCameraPermission(false);
                        toast.error(
                          "Camera permission was denied. Please enable camera access in your browser settings and try again."
                        );
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm h-12 px-6"
                  >
                    <Camera className="h-5 w-5" />
                    Allow Camera Access
                  </Button>
                </div>
              ) : scanResult ? (
                <ScannedDataDisplay
                  scanResult={scanResult}
                  onReset={() => handleRestartScanning()}
                />
              ) : (
                <>
                  {/* Scan Mode Selection - make buttons bigger */}
                  <div className="flex justify-center mb-5 gap-3">
                    <Button
                      variant={scanMode === "camera" ? "default" : "outline"}
                      onClick={() => handleScanModeChange("camera")}
                      className="flex items-center gap-2 text-sm px-4 h-12 min-w-[120px]"
                    >
                      <QrCode className="h-5 w-5" />
                      Scan QR
                    </Button>
                    <Button
                      variant={scanMode === "image" ? "default" : "outline"}
                      onClick={() => handleScanModeChange("image")}
                      className="flex items-center gap-2 text-sm px-4 h-12 min-w-[120px]"
                    >
                      <Upload className="h-5 w-5" />
                      Upload
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

                  {/* Make scanner area bigger on mobile */}
                  <div
                    id="qr-reader"
                    className="w-full max-w-[300px] sm:max-w-md mx-auto"
                  />

                  {/* Camera selection dropdown */}
                  {scanMode === "camera" && availableCameras.length > 1 && (
                    <div className="mt-3 flex justify-center">
                      <div className="relative w-full max-w-[300px] sm:max-w-md">
                        <select
                          value={cameraId || ""}
                          onChange={(e) => {
                            const newCameraId = e.target.value;
                            setCameraId(newCameraId);

                            // If currently scanning, stop and restart with new camera
                            if (scanner && scanner.isScanning) {
                              scanner.stop().then(() => {
                                setIsScanning(false);
                                setTimeout(() => {
                                  if (newCameraId) {
                                    setCameraId(newCameraId);
                                    startCameraScanning();
                                  }
                                }, 500);
                              });
                            } else if (newCameraId) {
                              // If not scanning, just update the camera ID
                              setCameraId(newCameraId);
                              startCameraScanning();
                            }
                          }}
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="" disabled>
                            Select Camera
                          </option>
                          {availableCameras.map((camera) => (
                            <option key={camera.id} value={camera.id}>
                              {camera.label || `Camera ${camera.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-5">
                    {scanMode === "camera" && (
                      <>
                        {isScanning ? (
                          <Button
                            variant="destructive"
                            onClick={stopScanning}
                            className="flex items-center gap-2 text-sm px-5 h-12"
                          >
                            <X className="h-5 w-5" />
                            Stop Scanning
                          </Button>
                        ) : (
                          <></>
                          // <Button
                          //   onClick={startCameraScanning}
                          //   className="flex items-center gap-2 text-sm px-5 h-12"
                          // >
                          //   <QrCode className="h-5 w-5" />
                          //   Start Scanning
                          // </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 border-b p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Anubandh Profile Verification
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Search and approve profiles by Anubandh ID
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-sm"
                >
                  Search
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-5 p-4 sm:p-6">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Anubandh ID"
                    value={anubandhId}
                    onChange={(e) => setAnubandhId(e.target.value)}
                    className="pl-10 h-12 text-base"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchByAnubandhId()
                    }
                  />
                </div>
                <Button
                  onClick={handleSearchByAnubandhId}
                  disabled={isSearching || !anubandhId.trim()}
                  className="gap-2 h-12 text-sm px-4 min-w-[100px]"
                >
                  <Search className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchError && (
                <Alert variant="destructive" className="mt-4 text-sm">
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {profileData && (
                <Card className="mt-5 border-slate-200">
                  <CardHeader className="pb-2 p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Profile Details</CardTitle>
                      <Badge
                        variant={
                          profileData.approvalStatus ? "secondary" : "outline"
                        }
                        className={`text-sm ${
                          profileData.approvalStatus
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        {profileData.approvalStatus
                          ? "Approved"
                          : "Pending Approval"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-5">
                      {/* Photo section - centered on mobile, left-aligned on desktop */}
                      <div className="flex justify-center md:justify-start">
                        {profileData.photo ? (
                          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-slate-200">
                            <AvatarImage
                              src={profileData.photo}
                              alt={`Photo of ${profileData.name}`}
                            />
                            <AvatarFallback>
                              {profileData.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-slate-200">
                            <AvatarFallback>
                              <User className="h-8 w-8 md:h-10 md:w-10" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Profile information */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-base">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{profileData.name}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium break-words">
                            {profileData.email}
                          </p>
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
                            {new Date(
                              profileData.dateOfBirth
                            ).toLocaleDateString("en-GB")}
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

                        <div className="sm:col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Education
                          </p>
                          <p className="font-medium">{profileData.education}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Guest Count:
                          </p>
                          <p className="font-medium">
                            {profileData.attendeeCount || 1}
                          </p>
                        </div>

                        {/* Introduction Status - show checkbox or status */}
                        <div className="sm:col-span-2 mt-2">
                          {/* If already approved and has introduction status, show it as text */}
                          {profileData.approvalStatus &&
                            profileData.introductionStatus && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Introduction Status
                                </p>
                                <p className="font-medium text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Interested for Introduction
                                </p>
                              </div>
                            )}

                          {/* For profiles that are either not approved, or approved but without introduction status */}
                          {canApprove &&
                            (!profileData.approvalStatus ||
                              (profileData.approvalStatus &&
                                !profileData.introductionStatus)) && (
                              <div className="border-t pt-4 mt-1">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="introductionStatus"
                                    checked={introductionChecked}
                                    onCheckedChange={(checked) =>
                                      setIntroductionChecked(checked === true)
                                    }
                                    disabled={isSubmitting}
                                    className="h-5 w-5"
                                  />
                                  <Label
                                    htmlFor="introductionStatus"
                                    className="font-medium cursor-pointer text-sm"
                                  >
                                    Interested for Introduction
                                  </Label>
                                </div>
                                {!profileData.approvalStatus && (
                                  <p className="text-gray-600 text-sm mt-2">
                                    Introduction status will be saved when the
                                    entry is approved
                                  </p>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end space-x-3 pt-2 pb-4 px-4 sm:px-6">
                    {/* Show approve button for profiles that are not approved */}
                    {canApprove && !profileData.approvalStatus && (
                      <Button
                        onClick={handleApproveProfile}
                        disabled={isSubmitting}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-sm h-12 px-5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isSubmitting ? "Processing..." : "Approve Entry"}
                      </Button>
                    )}

                    {/* Show update introduction status button for approved profiles without introduction status */}
                    {canApprove &&
                      profileData.approvalStatus &&
                      !profileData.introductionStatus && (
                        <Button
                          onClick={handleUpdateIntroductionStatus}
                          disabled={isSubmitting}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm h-12 px-5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isSubmitting
                            ? "Saving..."
                            : "Set Introduction Status"}
                        </Button>
                      )}
                  </CardFooter>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile">
          <UsersTableWithSkeleton />
        </TabsContent>
      </Tabs>
    </div>
  );
}
