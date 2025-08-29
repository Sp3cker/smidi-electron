import { useToastStore } from "./ToastStore";
import "./toast.css";

const variantClass = (v?: string) => {
  switch (v) {
    case "success":
      return "toast--success";
    case "warning":
      return "toast--warning";
    case "error":
      return "toast--error";
    default:
      return "toast--info";
  }
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast `} role="status">
          <div className="toast__content">
            {t.title && <div className="toast__title">{t.title}</div>}
            <div className="toast__message">{t.message}</div>
          </div>
          <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Close">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
