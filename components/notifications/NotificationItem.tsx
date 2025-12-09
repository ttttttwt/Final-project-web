/**
 * NotificationItem Component
 *
 * Single notification item with icon, content, and actions.
 * Improved UI/UX with better visual hierarchy, animations, and accessibility.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Check, ExternalLink, Clock } from "lucide-react";
import {
  Notification,
  getNotificationIcon,
  formatNotificationTime,
  isHighPriority,
} from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const time = formatNotificationTime(notification.createdAt);
  const highPriority = isHighPriority(notification);
  const isTransient = notification.id?.startsWith("temp-");

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-4 cursor-pointer transition-all duration-200",
        "hover:bg-accent/50 border-b last:border-b-0",
        !notification.isRead && "bg-primary/5 hover:bg-primary/10",
        highPriority && !notification.isRead && "border-l-4 border-l-destructive bg-destructive/5",
        isTransient && "animate-pulse"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}: ${notification.message}${!notification.isRead ? " (unread)" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon with background */}
      <div className={cn(
        "shrink-0 flex items-center justify-center w-10 h-10 rounded-full",
        highPriority ? "bg-destructive/10" : "bg-muted"
      )}>
        <span className="text-xl" role="img" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm leading-tight truncate",
                !notification.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              )}
            >
              {notification.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!notification.isRead && (
              <span 
                className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" 
                aria-label="Unread"
              />
            )}
            {highPriority && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-destructive/10 text-destructive">
                Urgent
              </span>
            )}
          </div>
        </div>

        <p className={cn(
          "text-sm line-clamp-2",
          !notification.isRead ? "text-foreground/80" : "text-muted-foreground"
        )}>
          {notification.message}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <time dateTime={notification.createdAt}>{time}</time>
          </span>
          {isTransient && (
            <span className="text-amber-500 font-medium">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Actions - visible on hover with better styling */}
      <TooltipProvider delayDuration={300}>
        <div className={cn(
          "shrink-0 flex flex-col items-center gap-1",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
        )}>
          {!notification.isRead && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={handleMarkAsRead}
                  aria-label="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Mark as read
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDelete}
                aria-label="Delete notification"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Delete
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

/**
 * NotificationItemSkeleton - Loading state
 */
export function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b last:border-b-0 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </div>
    </div>
  );
}
