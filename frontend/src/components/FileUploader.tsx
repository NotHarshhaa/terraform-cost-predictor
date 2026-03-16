"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
  onAnalyze: (files: File[]) => void;
  isLoading: boolean;
}

export default function FileUploader({ onAnalyze, isLoading }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const tfFiles = acceptedFiles.filter((f) => f.name.endsWith(".tf"));
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = tfFiles.filter((f) => !existing.has(f.name));
      return [...prev, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".tf"] },
    multiple: true,
  });

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleAnalyze = () => {
    if (files.length > 0) {
      onAnalyze(files);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {isDragActive ? "Drop your Terraform files here" : "Upload Terraform Files"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop <code>.tf</code> files or click to browse
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Uploaded Files ({files.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleAnalyze}
              disabled={isLoading || files.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Infrastructure...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Predict Cost
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
