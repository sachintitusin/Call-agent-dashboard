import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ children, onClose }: Props) {
  // 🔑 Resolve inside render, but do NOT early-return before hooks
  const modalRoot = document.getElementById("modal-root");

  // ✅ Hooks are always called
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // ✅ Guard AFTER hooks
  if (!modalRoot) {
    console.error("Modal root not found");
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        {children}
      </div>
    </div>,
    modalRoot
  );
}
