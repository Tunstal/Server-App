const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getConfigs: () => ipcRenderer.invoke('get-configs'),
    startServer: (id) => ipcRenderer.invoke('start-server', id),
    stopServer: (id) => ipcRenderer.invoke('stop-server', id),
    onLog: (callback) => ipcRenderer.on('server-log', (_, data) => callback(data)),
    onStopped: (callback) => ipcRenderer.on('server-stopped', (_, data) => callback(data)),
});