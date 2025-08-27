import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={props.id}
          className="block mb-0 font-pkmnem text-lg font-bold text-stone-100"
        >
          {label}
        </label>
        <input ref={ref} className={`input ${className}`} {...props} />
        {error && (
          <p className="mt-2 font-pkmnem text-red-400 text-sm">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
