// All of the Node.js APIs are available in the preload process.

const { contextBridge, ipcRenderer, globalShortcut } = require("electron");

contextBridge.exposeInMainWorld("api", {
	setButton: (button: string) => ipcRenderer.send("set-button", button),
	setInterval: (interval: string) => ipcRenderer.invoke("set-interval", interval),
	setDuration: (duration: string) => ipcRenderer.invoke("set-duration", duration),
	setHotkey: (hotkey: string, set: boolean) => ipcRenderer.invoke("set-hotkey", hotkey, set),
	toggle: () => ipcRenderer.send("toggle"),
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
