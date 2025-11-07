const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require('child_process');
const path = require("path");
const fs = require('fs');

let servers = {};

function createWindow() {
    const window = new BrowserWindow({

        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    window.loadFile("index.html");
}

app.whenReady().then(() => {
    loadConfigs();
    createWindow();
});

function loadConfigs() {
    const configFile = path.join(__dirname, 'servers.json');
    if (fs.existsSync(configFile)) {
        configs = JSON.parse(fs.readFileSync(configFile));
    } else {
        configs = [];
    }
}

// IPC Handlers

ipcMain.handle('get-configs', () => configs);

ipcMain.handle('start-server', (event, id) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return `No config for ID ${id}`;
    if (servers[id]) return `${config.name} is already running`;

    const child = spawn(config.command, config.args, {
        cwd: config.cwd || process.cwd(),
        shell: true,
    });

    servers[id] = child;

    child.stdout.on('data', (data) => {
        event.sender.send('server-log', { id, log: data.toString() });
    });

    child.stderr.on('data', (data) => {
        event.sender.send('server-log', { id, log: `[ERROR] ${data.toString()}` });
    });

    child.on('close', (code) => {
        delete servers[id];
        event.sender.send(`server-stopped`, {id, code });
    });

    return `${config.name} started`;
});

ipcMain.handle('stop-server', (event, id) => {
    if (!servers[id]) return `Server ${id} not running`;
    servers[id].kill();
    delete servers[id];
    return `Server ${id} stopped`;
});