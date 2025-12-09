/**
 * NotificationList Component
 *
 * Scrollable list of notifications with empty state and improved UX.
 */

"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw, Inbox } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationItem, NotificationItemSkeleton } from "./NotificationItem";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-5 mb-4">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">All caught up!</h3>
        <p className="text-sm text-muted-foreground max-w-[220px]">
          No new notifications. We&apos;ll let you know when something arrives.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[420px]">
      <div>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id || `notification-${index}`}
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
          <div className="p-4 text-center border-t bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              className="w-full max-w-[200px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load older notifications
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
