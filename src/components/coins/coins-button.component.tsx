import { ClassNameValue } from "tailwind-merge";
import { Button } from "../ui/button";
import type { LucideIcon } from "lucide-react";

type CoinsButtonProps = {} & React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
    startIcon?: LucideIcon;
    endIcon?: LucideIcon;
    isDisabled?: boolean;
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    className?: ClassNameValue;
}

export default function CoinsButton({
    isLoading,
    children,
    startIcon: StartIcon,
    endIcon: EndIcon,
    isDisabled,
    variant = "primary",
    className,
    ...props
}: CoinsButtonProps) {
  return (
    <Button isDisabled={isDisabled || isLoading} intent={variant} className={className} type={props.type} onClick={props.onClick as any}>
      {StartIcon && <StartIcon className="mr-2 h-4 w-4" />}
      {children}
      {EndIcon && <EndIcon className="ml-2 h-4 w-4" />}
    </Button>
  );
}