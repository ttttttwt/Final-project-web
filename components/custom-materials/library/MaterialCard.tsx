"use client";

import { cn } from "@/lib/utils";
import { MaterialListItem, CustomMaterialStatus } from "@/types/custom-materials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  FileType,
  Image as ImageIcon,
  Youtube,
  Globe,
  Type,
  MoreVertical,
  Eye,
  MessageSquare,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  HelpCircle,
} from "lucide-react";

const sourceTypeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5" />,
  DOCX: <FileType className="h-5 w-5" />,
  IMAGE: <ImageIcon className="h-5 w-5" />,
  YOUTUBE: <Youtube className="h-5 w-5" />,
  WEBSITE: <Globe className="h-5 w-5" />,
  TEXT: <Type className="h-5 w-5" />,
};

const statusConfig: Record<
  CustomMaterialStatus,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  PENDING: {
    icon: <Clock className="h-3 w-3" />,
    label: "Queued",
    color: "text-[#F57F17]",
    bgColor: "bg-[#FFF8E1] dark:bg-[#F57F17]/20",
  },
  PROCESSING: {
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: "Processing",
    color: "text-[#4285F4]",
    bgColor: "bg-[#E3F2FD] dark:bg-[#4285F4]/20",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-3 w-3" />,
    label: "Ready",
    color: "text-[#4CAF50]",
    bgColor: "bg-[#E8F5E9] dark:bg-[#4CAF50]/20",
  },
  FAILED: {
    icon: <XCircle className="h-3 w-3" />,
    label: "Failed",
    color: "text-[#D32F2F]",
    bgColor: "bg-[#FFEBEE] dark:bg-[#D32F2F]/20",
  },
};

interface MaterialCardProps {
  material: MaterialListItem;
  onView: (id: string) => void;
  onChat?: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

/**
 * Card component for displaying a material in the library grid.
 */
export function MaterialCard({
  material,
  onView,
  onChat,
  onDelete,
  className,
}: MaterialCardProps) {
  const status = statusConfig[material.status];
  const isReady = material.status === "COMPLETED";
  const hasRolePlay = material.hasRolePlay;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:border-[#4285F4]/50 cursor-pointer",
        !isReady && "opacity-80",
        className
      )}
      onClick={() => isReady && onView(material.id)}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={cn("gap-1", status.bgColor, status.color, "border-0")}>
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        {/* Source type icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
            "bg-[#F1F3F4] dark:bg-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6]"
          )}
        >
          {sourceTypeIcons[material.sourceType]}
        </div>

        <CardTitle className="text-base line-clamp-2 pr-16">
          {material.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {formatDate(material.createdAt)}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content counts */}
        {isReady && (
          <div className="flex flex-wrap gap-2 mb-3">
            {material.vocabularyCount && material.vocabularyCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                <BookOpen className="h-3 w-3" />
                {material.vocabularyCount} words
              </div>
            )}
            {material.quizCount && material.quizCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                <HelpCircle className="h-3 w-3" />
                {material.quizCount} questions
              </div>
            )}
            {material.hasRolePlay && (
              <div className="flex items-center gap-1 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                <MessageSquare className="h-3 w-3" />
                Role-play
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div
          className="flex gap-2 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isReady && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => onView(material.id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              {hasRolePlay && onChat && (
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => onChat(material.id)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Practice
                </Button>
              )}
            </>
          )}

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isReady && (
                <DropdownMenuItem onClick={() => onView(material.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(material.id)}
                className="text-[#D32F2F] focus:text-[#D32F2F]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
