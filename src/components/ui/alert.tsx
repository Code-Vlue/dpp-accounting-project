"use client";

// src/components/ui/alert.tsx
import * as React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "danger";
}

export function Alert({
  className = "",
  variant = "default",
  ...props
}: AlertProps) {
  const baseStyles = "relative rounded-lg border p-4";
  
  const variantStyles = {
    default: "bg-white text-gray-900 border-gray-200",
    info: "bg-blue-50 text-blue-800 border-blue-100",
    success: "bg-green-50 text-green-800 border-green-100",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-100",
    danger: "bg-red-50 text-red-800 border-red-100",
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  return (
    <div
      role="alert"
      className={combinedClassName}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function AlertTitle({ className = "", ...props }: AlertTitleProps) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className = "", ...props }: AlertDescriptionProps) {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    />
  );
}

export default Alert;