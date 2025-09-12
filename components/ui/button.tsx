"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};
const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900/50",
  secondary: "border border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-slate-900/50",
  ghost: "hover:bg-slate-100",
  outline: "border border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-slate-900/50",
};
const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
}

export const buttonVariants = (variant: ButtonProps["variant"] = "primary", size: ButtonProps["size"] = "md") => {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantMap[variant],
    sizeMap[size]
  );
};