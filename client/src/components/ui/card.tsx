import * as React from "react";
import { twMerge } from "tailwind-merge";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("rounded-lg border p-4", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge("font-semibold text-lg", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("text-sm", className)} {...props} />;
}


