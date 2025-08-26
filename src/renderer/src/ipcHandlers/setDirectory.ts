const setDirectory = (directory: string): Promise<void> =>
  window.electron.ipcRenderer.invoke("ping", directory);
export default setDirectory;
