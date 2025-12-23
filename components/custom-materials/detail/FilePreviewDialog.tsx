"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomMaterialSourceType } from "@/types/custom-materials";
import { getAccessToken } from "@/lib/tokenStorage";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  sourceType: CustomMaterialSourceType;
  title?: string;
  contentText?: string;
}

/**
 * FilePreviewDialog - Preview PDF, DOCX, Images with full screen option
 * For PDF/DOCX: Shows embedded viewer or iframe
 * For Image: Shows zoomable image preview
 * For Text: Shows text content directly
 */
export function FilePreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  sourceType,
  title = "Original Source",
  contentText,
}: FilePreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Build full URL with authentication
  const getAuthenticatedUrl = () => {
    if (!fileUrl) return null;
    
    // If already a full URL, return as is
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    
    // Get base URL and handle the path correctly
    // NEXT_PUBLIC_API_URL might be like "http://localhost:8088/api/v1"
    // fileUrl might be like "/api/v1/files/..." or "/files/..."
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    
    // Remove /api/v1 from base URL if fileUrl already starts with /api/v1
    if (fileUrl.startsWith("/api/v1")) {
      // Extract just the host part (e.g., "http://localhost:8088")
      const baseUrlWithoutPath = baseUrl.replace(/\/api\/v1\/?$/, "");
      return `${baseUrlWithoutPath}${fileUrl}`;
    }
    
    // Otherwise, append fileUrl to base URL
    return `${baseUrl}${fileUrl}`;
  };

  // Fetch file with authentication for binary files (PDF, DOCX, IMAGE)
  useEffect(() => {
    if (!open || !fileUrl) return;

    const fetchFileWithAuth = async () => {
      setIsLoading(true);
      setError(null);

      // For TEXT source type, we don't need to fetch
      if (sourceType === "TEXT") {
        setIsLoading(false);
        return;
      }

      try {
        const fullUrl = getAuthenticatedUrl();
        if (!fullUrl) {
          setError("File URL not available");
          setIsLoading(false);
          return;
        }

        const token = getAccessToken();
        const response = await fetch(fullUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading file:", err);
        setError(err instanceof Error ? err.message : "Failed to load file");
        setIsLoading(false);
      }
    };

    fetchFileWithAuth();

    return () => {
      // Cleanup blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileUrl, sourceType]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setImageZoom(1);
      setImageRotation(0);
      setIsLoading(true);
      setError(null);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDownload = () => {
    const url = blobUrl || getAuthenticatedUrl();
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = title || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getSourceIcon = () => {
    switch (sourceType) {
      case "PDF":
        return <FileText className="h-5 w-5" />;
      case "DOCX":
        return <File className="h-5 w-5" />;
      case "IMAGE":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderContent = () => {
    // Loading state
    if (isLoading && sourceType !== "TEXT") {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Failed to load preview</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      );
    }

    // TEXT content
    if (sourceType === "TEXT" && contentText) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <div className="prose dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{contentText}</p>
          </div>
        </div>
      );
    }

    // PDF preview
    if (sourceType === "PDF" && blobUrl) {
      return (
        <div className="h-[70vh] w-full rounded-lg overflow-hidden border">
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=1`}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      );
    }

    // DOCX preview - Show download prompt since browsers can't render DOCX directly
    if (sourceType === "DOCX") {
      return (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <div className="p-6 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <File className="h-12 w-12 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">Word Document</p>
            <p className="text-sm text-muted-foreground mt-1">
              DOCX files cannot be previewed directly in the browser.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download to View
            </Button>
            {blobUrl && (
              <Button variant="outline" onClick={handleOpenExternal} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            )}
          </div>
        </div>
      );
    }

    // IMAGE preview with zoom controls
    if (sourceType === "IMAGE" && blobUrl) {
      return (
        <div className="flex flex-col gap-4">
          {/* Image controls */}
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setImageZoom(Math.max(0.25, imageZoom - 0.25))}
              disabled={imageZoom <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
              disabled={imageZoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setImageRotation((imageRotation + 90) % 360)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setImageZoom(1);
                setImageRotation(0);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Image container */}
          <div className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/10">
            <div className="flex items-center justify-center min-h-[300px] p-4">
              {/* Using inline style is necessary for dynamic zoom/rotation transforms */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={title}
                className={cn(
                  "max-w-full transition-transform duration-200",
                  imageZoom === 0.25 && "scale-[0.25]",
                  imageZoom === 0.5 && "scale-[0.5]",
                  imageZoom === 0.75 && "scale-[0.75]",
                  imageZoom === 1 && "scale-100",
                  imageZoom === 1.25 && "scale-[1.25]",
                  imageZoom === 1.5 && "scale-[1.5]",
                  imageZoom === 1.75 && "scale-[1.75]",
                  imageZoom === 2 && "scale-[2]",
                  imageZoom === 2.25 && "scale-[2.25]",
                  imageZoom === 2.5 && "scale-[2.5]",
                  imageZoom === 2.75 && "scale-[2.75]",
                  imageZoom === 3 && "scale-[3]",
                  imageRotation === 90 && "rotate-90",
                  imageRotation === 180 && "rotate-180",
                  imageRotation === 270 && "-rotate-90"
                )}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>
        </div>
      );
    }

    // YOUTUBE or WEBSITE - Show link
    if ((sourceType === "YOUTUBE" || sourceType === "WEBSITE") && fileUrl) {
      const url = fileUrl.startsWith("http") ? fileUrl : getAuthenticatedUrl();
      return (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <div className="p-6 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <ExternalLink className="h-12 w-12 text-purple-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{sourceType === "YOUTUBE" ? "YouTube Video" : "Website"}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md break-all">
              {url}
            </p>
          </div>
          <Button
            onClick={() => window.open(url || "", "_blank", "noopener,noreferrer")}
            className="gap-2 mt-4"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      );
    }

    // Fallback - no content
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
        <div className="p-6 rounded-full bg-muted">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No preview available</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col",
          sourceType === "IMAGE" && "sm:max-w-5xl"
        )}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E8F5E9] dark:bg-[#1E3A2E]">
                <div className="text-[#34A853]">{getSourceIcon()}</div>
              </div>
              <div>
                <DialogTitle className="text-lg">{title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {sourceType}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(sourceType === "PDF" || sourceType === "IMAGE") && blobUrl && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
