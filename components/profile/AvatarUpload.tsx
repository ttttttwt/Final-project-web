"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { userService } from "@/services/userService";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, GIF, or WebP images.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB. Please choose a smaller image.";
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
      setShowPreviewDialog(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (since we don't have real upload progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await userService.uploadAvatar(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update avatar URL
      const newAvatarUrl = response.avatarUrl;
      setAvatarUrl(newAvatarUrl);

      // Notify parent component
      if (onAvatarUpdate && newAvatarUrl) {
        onAvatarUpdate(newAvatarUrl);
      }

      toast.success("Avatar updated successfully!", {
        description: "Your profile picture has been changed.",
      });

      // Close dialog after short delay
      setTimeout(() => {
        setShowPreviewDialog(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar", {
        description: "Please try again or choose a different image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!avatarUrl) return;

    try {
      setIsDeleting(true);
      await userService.deleteAvatar();

      setAvatarUrl(undefined);

      // Notify parent component
      if (onAvatarUpdate) {
        onAvatarUpdate("");
      }

      toast.success("Avatar removed successfully");
    } catch (error) {
      console.error("Avatar delete error:", error);
      toast.error("Failed to delete avatar", {
        description: "Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowPreviewDialog(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-gray-200 dark:border-gray-700">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="text-3xl font-semibold bg-linear-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          onClick={triggerFileInput}
        >
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload avatar"
      />

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>

        {avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Recommended: Square image, at least 200x200px
        <br />
        Max size: 5MB • Formats: JPG, PNG, GIF, WebP
      </p>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
            <DialogDescription>
              Preview your new profile picture before uploading.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {previewUrl && (
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {isUploading && (
              <div className="w-full space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {selectedFile && !isUploading && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
