// src/app/components/CsvUploader.tsx

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileType,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface UploadStats {
  total: number;
  processed: number;
  errors: number;
}

export default function CsvUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      setFileName(file.name);

      if (file.type !== "text/csv") {
        toast.error("Please upload a CSV file");
        setIsUploading(false);
        return;
      }

      Papa.parse(file, {
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            toast.error("Error parsing CSV file");
            console.error("Parse errors:", results.errors);
            setIsUploading(false);
            return;
          }

          setFileData(results.data);
          setUploadProgress(100);
          setIsUploading(false);
          toast.success("File parsed successfully");
        },
        error: (error) => {
          toast.error("Error parsing CSV file");
          console.error("Parse error:", error);
          setIsUploading(false);
        },
        header: true,
        skipEmptyLines: true,
      });

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleUploadToServer = async () => {
    if (fileData.length === 0) {
      toast.error("No data to upload");
      return;
    }

    setIsProcessing(true);
    setUploadStats(null);

    try {
      // Convert data back to CSV for upload
      const csv = Papa.unparse(fileData);
      const csvBlob = new Blob([csv], { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", csvBlob, fileName || "profiles.csv");

      const response = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload data");
      }

      setUploadStats({
        total: fileData.length,
        processed: result.message.match(/Processed (\d+)/)?.[1] || 0,
        errors: result.errors?.length || 0,
      });

      toast.success("Data uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload data to server");
      console.error("Upload error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anubandh Profile CSV Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Drop the file here</p>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Drag and drop a CSV file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Only CSV files are supported
              </p>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileType className="h-4 w-4" />
              <span className="text-sm">Parsing file...</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {fileData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {fileName || "File"} parsed successfully ({fileData.length}{" "}
                records)
              </span>
            </div>

            <div className="border rounded-md p-4 bg-slate-50">
              <h3 className="font-medium mb-2">CSV Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(fileData[0])
                        .slice(0, 5)
                        .map((header) => (
                          <th key={header} className="text-left p-2">
                            {header}
                          </th>
                        ))}
                      <th className="text-left p-2">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row)
                          .slice(0, 5)
                          .map((value, i) => (
                            <td key={i} className="p-2">
                              {String(value).substring(0, 20)}
                              {String(value).length > 20 ? "..." : ""}
                            </td>
                          ))}
                        <td className="p-2">...</td>
                      </tr>
                    ))}
                    {fileData.length > 3 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-2 text-muted-foreground"
                        >
                          + {fileData.length - 3} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              onClick={handleUploadToServer}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to Database
                </>
              )}
            </Button>

            {uploadStats && (
              <div
                className={`p-4 rounded-md ${
                  uploadStats.errors > 0 ? "bg-amber-50" : "bg-green-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadStats.errors > 0 ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-medium">Upload Results</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Total records: {uploadStats.total}</li>
                  <li>Successfully processed: {uploadStats.processed}</li>
                  {uploadStats.errors > 0 && (
                    <li className="text-amber-600">
                      Errors: {uploadStats.errors}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
