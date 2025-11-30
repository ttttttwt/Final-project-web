/**
 * NotificationList Component
 *
 * Scrollable list of notifications with empty state.
 */

"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationItem, NotificationItemSkeleton } from "./NotificationItem";

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  hasMore?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
  onLoadMore?: () => void;
}

export function NotificationList({
  notifications,
  isLoading = false,
  hasMore = false,
  onMarkAsRead,
  onDelete,
  onClick,
  onLoadMore,
}: NotificationListProps) {
  // Empty state
  if (!isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No notifications</h3>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          When you receive notifications, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onClick={onClick}
          />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <NotificationItemSkeleton key={`skeleton-${i}`} />
          ))}

        {/* Load more button */}
        {!isLoading && hasMore && (
          <div className="p-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load more
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
