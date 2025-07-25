import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "data-testid"?: string;
}

export default function GradientButton({ 
  children, 
  onClick,
  className,
  disabled = false,
  type = "button",
  "data-testid": testId,
}: GradientButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gradient-bg text-white font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      data-testid={testId}
    >
      {children}
    </Button>
  );
}
