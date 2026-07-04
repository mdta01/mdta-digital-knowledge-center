"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  /** Controlled open state (optional). If not provided, the trigger controls it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger element — when provided, renders a controlled trigger */
  trigger?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Called when the confirm button is clicked. May return a Promise. */
  onConfirm: () => Promise<void> | void;
  /** Variant for the confirm button */
  confirmVariant?: "default" | "destructive";
  loading?: boolean;
}

/**
 * Reusable confirmation dialog.
 * When `trigger` is passed, the dialog is opened from it.
 * Otherwise controlled via `open` / `onOpenChange`.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  confirmVariant = "destructive",
  loading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (internalLoading) return;
    setInternalLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setInternalLoading(false);
    }
  };

  const content = (
    <AlertDialogContent className="rounded-3xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-serif text-lg">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          disabled={internalLoading || loading}
          className="rounded-full"
        >
          {cancelLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={internalLoading || loading}
          className={cn(
            "rounded-full",
            confirmVariant === "destructive" &&
              "bg-destructive text-white hover:bg-destructive/90"
          )}
        >
          {internalLoading ? "Memproses…" : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (trigger) {
    return (
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {content}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {content}
    </AlertDialog>
  );
}

/** Convenience button + dialog combo */
export function ConfirmButton({
  buttonLabel,
  buttonVariant = "outline",
  buttonSize = "icon",
  buttonClassName,
  ...confirmProps
}: ConfirmDialogProps & {
  buttonLabel?: React.ReactNode;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  buttonClassName?: string;
}) {
  return (
    <ConfirmDialog
      {...confirmProps}
      trigger={
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={buttonClassName}
        >
          {buttonLabel}
        </Button>
      }
    />
  );
}
