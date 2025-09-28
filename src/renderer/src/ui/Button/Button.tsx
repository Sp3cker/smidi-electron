import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", className = "", disabled, children, ...props },
    ref
  ) => {
    const variantClasses = {
      primary: "bg-[var(--color-neir-lighter)]",
      secondary: "text-[var(--yatsugi-white-1)]",
      danger: "bg-red-900 hover:bg-red-800 border-red-600",
    };

    return (
      <button
        ref={ref}
        className={`
            button
            focus:ring-0
            hover-active-button
          ${variantClasses[variant]}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
