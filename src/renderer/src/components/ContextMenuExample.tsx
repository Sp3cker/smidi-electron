import React, { useState, useRef } from "react";
import { useContextMenu } from "../store";
import { ContextMenu } from "./ContextMenu";
import {
  copyToClipboard,
  pasteFromClipboard,
  getSelectedText,
} from "../utils/clipboard";

interface ContextMenuItem {
  label: string;
  action: string;
  type?: "normal" | "separator" | "checkbox" | "radio";
  checked?: boolean;
  enabled?: boolean;
  icon?: string;
  shortcut?: string;
}

const ContextMenuExample: React.FC = () => {
  const [text, setText] = useState(
    "Select some text and right-click for options!"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isVisible, position, items, showContextMenu, hideContextMenu } =
    useContextMenu();

  const handleContextMenuAction = async (action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    switch (action) {
      case "copy":
        const selectedText = getSelectedText();
        if (selectedText) {
          const success = await copyToClipboard(selectedText);
          if (success) {
            console.log("Text copied to clipboard");
          }
        }
        break;

      case "paste":
        try {
          const clipboardText = await pasteFromClipboard();
          if (clipboardText) {
            // Insert at cursor position or replace selection
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText =
              text.slice(0, start) + clipboardText + text.slice(end);
            setText(newText);

            // Set cursor position after pasted text
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd =
                start + clipboardText.length;
              textarea.focus();
            }, 0);
          }
        } catch (error) {
          console.error("Paste failed:", error);
        }
        break;

      case "select-all":
        textarea.select();
        break;

      case "clear":
        setText("");
        textarea.focus();
        break;

      default:
        console.log("Unknown action:", action);
    }
  };

  const menuItems: ContextMenuItem[] = [
    {
      label: "Copy",
      action: "copy",
      icon: "📋",
      shortcut: "Ctrl+C",
      enabled: getSelectedText().length > 0,
    },
    {
      label: "Paste",
      action: "paste",
      icon: "📄",
      shortcut: "Ctrl+V",
    },
    { type: "separator" as const },
    {
      label: "Select All",
      action: "select-all",
      icon: "📝",
      shortcut: "Ctrl+A",
    },
    { type: "separator" },
    {
      label: "Clear",
      action: "clear",
      icon: "🗑️",
      enabled: text.length > 0,
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Custom HTML Context Menu Example
      </h2>

      <div className="space-y-4">
        <p className="text-gray-600">
          Right-click in the text area below to see the custom context menu with
          copy & paste functionality.
        </p>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onContextMenu={(e) => showContextMenu(e, menuItems)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type something here and right-click..."
        />

        <div className="text-sm text-gray-500">
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Custom HTML context menu (no native OS menu)</li>
            <li>Copy selected text to clipboard</li>
            <li>Paste from clipboard into text area</li>
            <li>Select all text</li>
            <li>Clear all text</li>
            <li>Keyboard shortcuts displayed</li>
            <li>Menu items enabled/disabled based on context</li>
          </ul>
        </div>
      </div>

      {/* Render the context menu */}
      {isVisible && (
        <ContextMenu
          items={items}
          position={position}
          onAction={handleContextMenuAction}
          onClose={hideContextMenu}
        />
      )}
    </div>
  );
};

export default ContextMenuExample;
