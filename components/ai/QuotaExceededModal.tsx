"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown } from "lucide-react";
import Link from "next/link";

interface QuotaExceededModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    used: number;
    limit: number;
    planType?: "FREE" | "MONTHLY" | "YEARLY";
}

export function QuotaExceededModal({
    isOpen,
    onClose,
    featureName,
    used,
    limit,
    planType = "FREE",
}: QuotaExceededModalProps) {
    const isPro = planType === "MONTHLY" || planType === "YEARLY";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <DialogTitle className="text-xl">Đã Đạt Giới Hạn Quota</DialogTitle>
                    </div>
                    <DialogDescription className="text-left pt-2">
                        Bạn đã sử dụng hết <strong>{featureName}</strong> cho tháng này trên gói{" "}
                        <strong>{isPro ? "Pro" : "Free"}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Đã sử dụng:</span>
                        <span className="font-mono font-semibold">
                            {used}/{limit}
                        </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>

                {!isPro && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <Crown className="h-8 w-8 text-primary" />
                        <div>
                            <p className="font-medium">Nâng cấp lên Pro để tiếp tục!</p>
                            <p className="text-sm text-muted-foreground">
                                Nhận quota cao hơn 3-5 lần và nhiều tính năng độc quyền
                            </p>
                        </div>
                    </div>
                )}

                {isPro && (
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Quota của bạn sẽ được reset vào đầu chu kỳ thanh toán tiếp theo.
                            Nếu cần nhiều hơn, vui lòng liên hệ support.
                        </p>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Để sau
                    </Button>
                    {!isPro && (
                        <Button asChild className="flex-1">
                            <Link href="/subscription">
                                <Crown className="h-4 w-4 mr-2" />
                                Nâng cấp Pro
                            </Link>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuotaExceededModal;
