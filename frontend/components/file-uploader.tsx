"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, Sparkles, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
  onAnalyze: (files: File[]) => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function FileUploader({ onAnalyze, onClear, isLoading }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = acceptedFiles.filter(f => !existingNames.has(f.name) && f.name.endsWith('.tf'));
      return [...prev, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".tf"],
      "application/octet-stream": [".tf"],
      "text/x-terraform": [".tf"],
    },
    disabled: isLoading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (files.length > 0) onAnalyze(files);
  };

  const loadSampleConfiguration = () => {
    const sampleEc2 = `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  count         = 3

  root_block_device {
    volume_size = 30
    volume_type = "gp2"
  }

  tags = {
    Name = "web-server"
  }
}

resource "aws_instance" "api" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "m5.large"
  count         = 2

  root_block_device {
    volume_size = 50
    volume_type = "gp3"
  }

  tags = {
    Name = "api-server"
  }
}
`;

    const sampleRds = `resource "aws_db_instance" "main" {
  identifier        = "main-database"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  storage_type      = "gp2"
  multi_az          = true

  tags = {
    Name = "main-database"
  }
}
`;

    const sampleNet = `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_nat_gateway" "main" {
  allocation_id = "eipalloc-12345"
  subnet_id     = "subnet-12345"
}

resource "aws_lb" "main" {
  name               = "main-alb"
  load_balancer_type = "application"
}

resource "aws_s3_bucket" "assets" {
  bucket = "prod-static-assets"
}
`;

    const sampleFiles = [
      new File([sampleEc2], "ec2.tf", { type: "text/plain" }),
      new File([sampleRds], "rds.tf", { type: "text/plain" }),
      new File([sampleNet], "networking.tf", { type: "text/plain" }),
    ];

    setFiles(sampleFiles);
  };

  return (
    <div className="space-y-5" id="file-upload">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse" />
        )}

        <div className="relative p-10 md:p-14 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className={`rounded-2xl p-4 transition-all duration-300 ${
                isDragActive
                  ? "bg-primary/20 rotate-6 scale-110"
                  : "bg-primary/10 group-hover:bg-primary/15 group-hover:scale-105"
              }`}>
                <Upload className={`h-8 w-8 transition-colors ${isDragActive ? "text-primary" : "text-primary/70"}`} />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 animate-ping" />
              )}
            </div>

            <div>
              <p className="text-lg font-semibold mb-1">
                {isDragActive ? "Drop files to upload" : "Drag & drop Terraform files"}
              </p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary font-medium">browse</span> to select .tf files
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs gap-1.5">
                <FileText className="h-3 w-3" />
                Supports .tf files
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1.5 border-dashed"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleConfiguration();
                }}
                disabled={isLoading}
              >
                <PlayCircle className="h-3.5 w-3.5 text-primary" />
                Load Sample Config
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => { setFiles([]); onClear(); }}
              disabled={isLoading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group/file"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover/file:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || files.length === 0}
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Configuration...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Predict Cost
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
