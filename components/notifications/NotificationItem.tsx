/**
 * NotificationItem Component
 *
 * Single notification item with icon, content, and actions.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
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
        "group relative flex gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50 border-b last:border-b-0",
        !notification.isRead && "bg-primary/5",
        highPriority &&
          !notification.isRead &&
          "border-l-2 border-l-destructive"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}: ${notification.message}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <span className="text-xl" role="img" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              !notification.isRead && "font-semibold"
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary" />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={notification.createdAt}>{time}</time>
          {highPriority && (
            <span className="text-destructive font-medium">
              • High Priority
            </span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMarkAsRead}
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          aria-label="Delete notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * NotificationItemSkeleton - Loading state
 */
export function NotificationItemSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b last:border-b-0">
      <div className="w-6 h-6 rounded bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
