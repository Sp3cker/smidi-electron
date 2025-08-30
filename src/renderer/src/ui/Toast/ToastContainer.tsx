import { AnimatePresence, motion } from "motion/react";
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
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast ${variantClass(t.variant)}`}
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, z: -1 }}
            drag="x"
            dragElastic={0.1}
            dragConstraints={{ left: 0 }}
            onUpdate={(latest) => {
              if ((latest.x as number) > 100) {
                dismiss(t.id);
              }
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            <div className="toast__content">
              {t.title && <div className="toast__title">{t.title}</div>}
              <div className="toast__message">{t.message}</div>
            </div>
            <button
              className="toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Close"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
