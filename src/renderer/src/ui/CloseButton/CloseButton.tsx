// src/components/ui/CloseButton.tsx
import React from "react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "rounded";
  "aria-label"?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = "",
  size = "md",
  variant = "default",
  "aria-label": ariaLabel = "Close",
}) => {
  const sizeClasses = {
    sm: "text-lg px-2",
    md: "text-3xl px-3",
    lg: "text-4xl px-4",
  };

  const variantClasses = {
    default: "font-pkmnem rounded hover:bg-neutral-700 hover:text-neutral-100",
    minimal: "font-pkmnem hover:opacity-70 rounded-md",
    rounded:
      "font-pkmnem rounded-full hover:bg-neutral-700 hover:text-neutral-100",
  };

  return (
    <button
      onClick={onClick}
      className={`cursor-pointer font-bold text-neutral-300 transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className} `}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
};

export default CloseButton;
