"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileType, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

export default function Admin() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);

      if (file.type !== "text/csv") {
        toast.error("Please upload a CSV file");
        setIsUploading(false);
        return;
      }

      Papa.parse(file, {
        complete: (results) => {
          setFileData(results.data);
          setUploadProgress(100);
          setIsUploading(false);
          toast.success("File uploaded successfully");
        },
        error: () => {
          toast.error("Error parsing CSV file");
          setIsUploading(false);
        },
        header: true,
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
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
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
                <span className="text-sm">Uploading...</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {fileData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Upload complete</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        {Object.keys(fileData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.slice(0, 5).map((row, index) => (
                        <tr
                          key={index}
                          className="border-t border-muted-foreground/10"
                        >
                          {Object.values(row).map((cell: any, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {fileData.length > 5 && (
                  <div className="p-2 bg-muted/50 text-center text-sm text-muted-foreground">
                    Showing 5 of {fileData.length} rows
                  </div>
                )}
              </div>
              <Button className="w-full">Process Data</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}