import React from 'react';

interface ContextMenuItem {
  label: string;
  action: string;
  type?: 'normal' | 'separator' | 'checkbox' | 'radio';
  checked?: boolean;
  enabled?: boolean;
  icon?: string;
  shortcut?: string;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onAction: (action: string) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onAction,
  onClose
}) => {
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.enabled !== false && item.type !== 'separator') {
      onAction(item.action);
      onClose();
    }
  };

  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    if (item.type === 'separator') {
      return (
        <div
          key={index}
          className="border-t border-gray-300 my-1"
        />
      );
    }

    const baseClasses = "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors";
    const disabledClasses = item.enabled === false ? "opacity-50 cursor-not-allowed" : "";
    const classes = `${baseClasses} ${disabledClasses}`;

    return (
      <div
        key={index}
        className={classes}
        onClick={() => handleItemClick(item)}
      >
        {item.icon && <span className="mr-2 text-gray-600">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="ml-4 text-xs text-gray-500">{item.shortcut}</span>
        )}
        {item.type === 'checkbox' && (
          <span className="ml-2 text-gray-600">
            {item.checked ? '✓' : ''}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Context menu */}
      <div
        className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-48"
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map(renderMenuItem)}
      </div>
    </>
  );
};
