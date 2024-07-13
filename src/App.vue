<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import "./electron-functions";

interface Settings {
	interval: string;
	duration: string;
	button: string;
	hotkey: string;
}

const intervalElmRef = ref() as Ref<HTMLInputElement>;
const durationElmRef = ref() as Ref<HTMLInputElement>;
const hotkeyElmRef = ref() as Ref<HTMLInputElement>;
const loadSettingsBtnRef = ref() as Ref<HTMLButtonElement>;

const hotkeyBtnText = ref("Set hotkey");

const intervalRef = ref("90");
const durationRef = ref("10");
const hotkeyRef = ref("f7");
const buttonRef = ref("left");

let hotkeySet = false;

async function updateInterval() {
	if (await window.api.setInterval(intervalRef.value)) intervalElmRef.value.classList.remove("invalid");
	else intervalElmRef.value.classList.add("invalid");
}

async function updateDuration() {
	if (await window.api.setDuration(durationRef.value)) durationElmRef.value.classList.remove("invalid");
	else durationElmRef.value.classList.add("invalid");
}

async function updateButton() {
	window.api.setButton(buttonRef.value);
}

function toggleHotkey() {
	if (hotkeySet) {
		window.api.setHotkey(hotkeyRef.value, false);
	} else {
		window.api.setHotkey(hotkeyRef.value, true);
	}
	hotkeySet = !hotkeySet;
	hotkeyElmRef.value.disabled = hotkeySet;
	loadSettingsBtnRef.value.disabled = hotkeySet;
}

async function saveSettings() {
	localStorage.setItem(
		"settings",
		JSON.stringify({
			interval: intervalRef.value,
			duration: durationRef.value,
			button: buttonRef.value,
			hotkey: hotkeyRef.value,
		})
	);
}

async function loadSettings() {
	const str = localStorage.getItem("settings");
	if (str) {
		const settings: Settings = JSON.parse(str);
		intervalRef.value = settings.interval;
		durationRef.value = settings.duration;
		buttonRef.value = settings.button;
		hotkeyRef.value = settings.hotkey;
	}
	await updateInterval();
	await updateDuration();
	await updateButton();
}

onMounted(async () => {
	await loadSettings();
});
</script>

<template>
	<div>
		<div class="grid">
			<div class="label">Interval</div>
			<input ref="intervalElmRef" v-model="intervalRef" @input="updateInterval" placeholder="milliseconds" />
			<div class="label">Duration</div>
			<input ref="durationElmRef" v-model="durationRef" @input="updateDuration" placeholder="milliseconds" />
			<div class="label">Button</div>
			<select v-model="buttonRef" @click="updateButton">
				<option value="left">Left</option>
				<option value="middle">Middle</option>
				<option value="right">Right</option>
			</select>
			<hr />
			<div>Hotkey</div>
			<input ref="hotkeyElmRef" v-model="hotkeyRef" />
			<button @click="toggleHotkey">{{ hotkeyBtnText }}</button>
			<hr />
			<button @click="saveSettings">Save settings</button>
			<button ref="loadSettingsBtnRef" @click="loadSettings">Load settings</button>
		</div>
	</div>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: min-content auto;
	align-items: center;
}
.grid > * {
	margin: 2px;
}
.grid > button,
.grid > hr {
	grid-column-start: 1;
	grid-column-end: 3;
}
div.label {
	margin-right: 10px;
	text-align: left;
}
</style>
