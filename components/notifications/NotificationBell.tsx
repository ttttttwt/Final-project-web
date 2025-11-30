/**
 * NotificationBell Component
 *
 * Bell icon with badge and dropdown popover for notifications.
 */

"use client";

import * as React from "react";
import { Bell, Check, Settings, Trash2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { NotificationList } from "./NotificationList";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = React.useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    hasMore,
    currentPage,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificationStore();

  // Fetch notifications and count on first open
  React.useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications(0);
    }
    if (open) {
      fetchUnreadCount();
    }
  }, [open, fetchNotifications, fetchUnreadCount, notifications.length]);

  const handleLoadMore = () => {
    fetchNotifications(currentPage + 1, true);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    await deleteAllRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} unread)` : ""
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Notifications</h2>
            {/* Connection status indicator */}
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" aria-label="Connected" />
            ) : (
              <WifiOff
                className="h-3 w-3 text-muted-foreground"
                aria-label="Disconnected"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          hasMore={hasMore}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
          onLoadMore={handleLoadMore}
          onClick={() => setOpen(false)}
        />

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAllRead}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            disabled={notifications.filter((n) => n.isRead).length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear read
          </Button>
          <Link href="/settings/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
