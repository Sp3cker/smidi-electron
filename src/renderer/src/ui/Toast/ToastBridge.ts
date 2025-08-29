type BridgeToast = {
  title?: string;
  description: string;
  timeout?: number;
};

type ToastManagerLike = {
  add: (t: { title?: string; description?: string; timeout?: number }) => void;
};

let manager: ToastManagerLike | null = null;
const queue: BridgeToast[] = [];

export function registerToastManager(m: ToastManagerLike) {
  manager = m;
  // Flush any queued toasts
  if (queue.length) {
    for (const t of queue.splice(0, queue.length)) {
      manager.add({ title: t.title, description: t.description, timeout: t.timeout });
    }
  }
}

function enqueue(toast: BridgeToast) {
  if (manager) manager.add(toast);
  else queue.push(toast);
}

function make(title: string | undefined, description: string, timeout?: number) {
  enqueue({ title, description, timeout });
}

export const toast = {
  info: (message: string, opts: { title?: string; timeout?: number } = {}) =>
    make(opts.title ?? "Info", message, opts.timeout ?? 4000),
  success: (message: string, opts: { title?: string; timeout?: number } = {}) =>
    make(opts.title ?? "Success", message, opts.timeout ?? 3000),
  warning: (message: string, opts: { title?: string; timeout?: number } = {}) =>
    make(opts.title ?? "Warning", message, opts.timeout ?? 5000),
  error: (message: string, opts: { title?: string; timeout?: number } = {}) =>
    make(opts.title ?? "Error", message, opts.timeout ?? 6000),
};
