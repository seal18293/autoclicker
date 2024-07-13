// All of the Node.js APIs are available in the preload process.

const { contextBridge, ipcRenderer, globalShortcut } = require("electron");

contextBridge.exposeInMainWorld("api", {
	setButton: (button: string) => ipcRenderer.send("set-button", button),
	setInterval: (interval: string) => {
		ipcRenderer.send("set-interval", interval);
		return new Promise((r) => ipcRenderer.once("set-interval-return", (_, v) => r(v)));
	},
	setDuration: (duration: string) => {
		ipcRenderer.send("set-duration", duration);
		return new Promise((r) => ipcRenderer.once("set-duration-return", (_, v) => r(v)));
	},
	setHotkey: (hotkey: string, set: boolean) => {
		ipcRenderer.send("set-hotkey", hotkey, set);
	},
	toggle: () => {
		ipcRenderer.send("toggle");
	},
});

// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
	const replaceText = (selector: any, text: any) => {
		const element = document.getElementById(selector);
		if (element) element.innerText = text;
	};

	for (const dependency of ["chrome", "node", "electron"]) {
		replaceText(`${dependency}-version`, process.versions[dependency]);
	}
});
