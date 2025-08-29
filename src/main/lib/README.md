# Electron Menu System

This directory contains the menu system for the SMidi Electron application.

## Files

- `Menu.ts` - Main menu template and creation functions
- `README.md` - This documentation file

## Usage

The menu system is automatically initialized when the main Electron process starts. It creates a cross-platform menu with the following structure:

### macOS Menu
- **SMidi** (App menu)
  - About SMidi
  - Services
  - Hide/Hide Others/Show All
  - Quit

### Cross-Platform Menus

#### File Menu
- New (Cmd/Ctrl+N)
- Open (Cmd/Ctrl+O)
- Save (Cmd/Ctrl+S)
- Save As... (Cmd/Ctrl+Shift+S)
- Quit (Windows/Linux only)

#### Edit Menu
- Undo (Cmd/Ctrl+Z)
- Redo (Cmd/Ctrl+Shift+Z)
- Cut (Cmd/Ctrl+X)
- Copy (Cmd/Ctrl+C)
- Paste (Cmd/Ctrl+V)
- Select All (Cmd/Ctrl+A)

#### View Menu
- Reload (Cmd/Ctrl+R)
- Force Reload (Cmd/Ctrl+Shift+R)
- Toggle Developer Tools (Alt+Cmd/Ctrl+I)
- Zoom controls
- Toggle Fullscreen (F11)

#### Window Menu (macOS only)
- Minimize
- Close
- Bring All to Front

#### Help Menu
- About SMidi (shows dialog)
- Documentation

## Customization

To modify the menu:

1. Edit `Menu.ts`
2. Update the `createMenuTemplate` function
3. Add menu items with proper types and accelerators
4. Implement click handlers for custom functionality

### Adding a New Menu Item

```typescript
{
  label: "My Custom Item",
  accelerator: "CmdOrCtrl+M",
  click: () => {
    // Your custom logic here
    console.log("Custom menu item clicked");
  }
}
```

### Adding a New Menu

```typescript
{
  label: "My Menu",
  submenu: [
    {
      label: "Item 1",
      click: () => console.log("Item 1 clicked")
    },
    {
      label: "Item 2",
      accelerator: "CmdOrCtrl+I",
      click: () => console.log("Item 2 clicked")
    }
  ]
}
```

## Platform-Specific Behavior

- **macOS**: Includes app menu and window menu
- **Windows/Linux**: File menu includes Quit option
- **All platforms**: Standard edit operations and view controls

## Keyboard Shortcuts

All standard keyboard shortcuts are supported:
- `Cmd/Ctrl+N` - New
- `Cmd/Ctrl+O` - Open
- `Cmd/Ctrl+S` - Save
- `Cmd/Ctrl+Shift+S` - Save As
- `Cmd/Ctrl+Z` - Undo
- `Cmd/Ctrl+Shift+Z` - Redo
- `Cmd/Ctrl+X` - Cut
- `Cmd/Ctrl+C` - Copy
- `Cmd/Ctrl+V` - Paste
- `Cmd/Ctrl+A` - Select All
- `Cmd/Ctrl+R` - Reload
- `F11` - Toggle Fullscreen

## Error Handling

The menu system includes error handling that falls back to a basic menu if template creation fails.

