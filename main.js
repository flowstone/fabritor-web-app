const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // 加载 React 应用的构建文件
  if (app.isPackaged) {
    // 在打包后的模式下加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    // 在开发模式下加载 React 开发服务器
    mainWindow.loadURL('http://localhost:3000');
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  // 打开开发者工具
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

