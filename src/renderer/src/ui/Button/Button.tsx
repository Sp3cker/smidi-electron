import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",

      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: "bg-zinc-900 hover:bg-zinc-800",
      secondary: "bg-zinc-700 hover:bg-zinc-600",
      danger: "bg-red-900 hover:bg-red-800 border-red-600",
    };

    return (
      <button
        ref={ref}
        className={`
            button
            focus:ring-0
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
