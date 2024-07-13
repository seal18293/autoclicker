interface Window {
	api: {
		quit: () => void;
		toggle: () => void;
		setButton: (button: string) => void;
		setInterval: (interval: string) => Promise<boolean>;
		setDuration: (duration: string) => Promise<boolean>;
		setHotkey: (hotkey: string, set: boolean) => void;
	};
}
