import { useEffect, useCallback, useState } from "react";

interface ContextMenuItem {
  label: string;
  action: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  checked?: boolean;
  enabled?: boolean;
  icon?: string;
  shortcut?: string;
}

export const useContextMenu = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const showContextMenu = useCallback(
    (event: React.MouseEvent, menuItems: ContextMenuItem[]) => {
      event.preventDefault();
      event.stopPropagation();

      // Calculate position to keep menu on screen
      const menuWidth = 192; // min-w-48 = 192px
      const menuHeight = menuItems.length * 36; // Rough estimate

      let x = event.clientX;
      let y = event.clientY;

      // Adjust if menu would go off screen
      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10;
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10;
      }

      setItems(menuItems);
      setPosition({ x, y });
      setIsVisible(true);
    },
    []
  );

  const hideContextMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Handle escape key and clicks outside
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  return {
    isVisible,
    position,
    items,
    showContextMenu,
    hideContextMenu,
  };
};
