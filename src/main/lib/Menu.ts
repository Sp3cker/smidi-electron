import type { App } from "electron";

// TypeScript interfaces for menu objects
interface MenuItem {
  label?: string;
  role?: string;
  type?: "separator" | "normal";
  accelerator?: string;
  click?: () => void;
  submenu?: MenuItem[];
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
}

type MenuTemplate = MenuItem[];

export default (app: App): MenuTemplate => {
  const isMac = process.platform === "darwin";

  return [
    // App Menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),

    // File Menu
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            console.log("New file");
          },
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            console.log("Open file");
          },
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            console.log("Save file");
          },
        },
        {
          label: "Save As...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => {
            console.log("Save as");
          },
        },
        { type: "separator" },
        ...(isMac ? [] : [{ role: "quit" }]),
      ],
    },

    // Edit Menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },

    // View Menu
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },

    // Window Menu (macOS only)
    ...(isMac
      ? [
          {
            label: "Window",
            submenu: [
              { role: "minimize" },
              { role: "close" },
              { type: "separator" },
              { role: "front" },
            ],
          },
        ]
      : []),

    // Help Menu
    {
      label: "Help",
      submenu: [
        {
          label: "About SMidi",
          click: () => {
            console.log("About SMidi");
          },
        },
        {
          label: "Documentation",
          click: () => {
            console.log("Open documentation");
          },
        },
      ],
    },
  ] as MenuTemplate;
};
