import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InterestTagProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  "data-testid"?: string;
}

export default function InterestTag({ 
  children, 
  selected = false, 
  onClick,
  className,
  "data-testid": testId,
}: InterestTagProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "interest-tag",
        selected && "selected",
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <span className="thai-text">{children}</span>
    </Button>
  );
}
