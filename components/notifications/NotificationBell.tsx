/**
 * NotificationBell Component
 *
 * Bell icon with badge and dropdown popover for notifications.
 * Improved UI/UX with better visual feedback and accessibility.
 */

"use client";

import * as React from "react";
import { Bell, Check, Settings, Trash2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const handleRefresh = () => {
    fetchNotifications(0);
    fetchUnreadCount();
  };

  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <TooltipProvider delayDuration={300}>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-9 w-9 rounded-full",
                  unreadCount > 0 && "text-primary",
                  className
                )}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              >
                <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-pulse")} />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px] font-bold flex items-center justify-center shadow-sm"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-[400px] p-0 shadow-lg" align="end" sideOffset={8}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base">Notifications</h2>
              {/* Connection status indicator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full",
                    isConnected ? "bg-green-500/10" : "bg-muted"
                  )}>
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isConnected ? "Real-time updates active" : "Connecting..."}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    className="h-8 w-8 rounded-full"
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Refresh
                </TooltipContent>
              </Tooltip>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 text-xs font-medium hover:text-primary"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
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
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAllRead}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              disabled={readCount === 0}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear read ({readCount})
            </Button>
            <Link href="/settings/notifications" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="h-8 text-xs hover:text-primary">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Settings
              </Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
