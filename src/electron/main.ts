import { dirname, join } from "path";
import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const native: {
	toggle: () => void;
	setButton: (button: number) => void;
	setInterval: (interval: string) => boolean;
	setDuration: (duration: string) => boolean;
} = require("../../native");

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 400,
		height: 400,
		webPreferences: {
			preload: join(__dirname, "preload.js"),
			webSecurity: true,
			contextIsolation: true,
		},
		autoHideMenuBar: true,
		show: false,
	});

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
		mainWindow.setResizable(true);
	});

	// and load the index.html of the app.
	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
		// mainWindow.webContents.openDevTools(); // Open the DevTools.
	} else {
		mainWindow.loadFile(join(__dirname, "../index.html"));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();
	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	app.quit();
});

ipcMain.handle("set-hotkey", (event, hotkey, set) => {
	try {
		if (set) {
			return globalShortcut.register(hotkey, () => {
				native.toggle();
			});
		} else {
			globalShortcut.unregister(hotkey);
		}
	} catch (e) {
		return false;
	}
	return true;
});

ipcMain.on("set-button", (_, button) => {
	native.setButton(button);
});

ipcMain.handle("set-interval", (_, interval) => native.setInterval(interval));

ipcMain.handle("set-duration", (_, duration) => native.setDuration(duration));
