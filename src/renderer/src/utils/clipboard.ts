// Clipboard utilities for copy and paste operations

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export const pasteFromClipboard = async (): Promise<string> => {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error("Failed to paste from clipboard:", error);
    return "";
  }
};

export const getSelectedText = (): string => {
  const selection = window.getSelection();
  return selection ? selection.toString() : "";
};
