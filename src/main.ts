import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import {
	DabinCalendarView,
	VIEW_TYPE_DABIN_CALENDAR,
} from "./calendar-view/index";

// Remember to rename these classes and interfaces!

interface DabinCalendarSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: DabinCalendarSettings = {
	mySetting: "default",
};

export default class DabinCalendarPlugin extends Plugin {
	settings: DabinCalendarSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status Bar Text");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		/**
		 * Register calendar view
		 */
		this.registerView(
			VIEW_TYPE_DABIN_CALENDAR,
			(leaf) => new DabinCalendarView(leaf)
		);
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Dabin Calendar",
			() => {
				this.activateView();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");
	}

	activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_DABIN_CALENDAR);
		if (leaves.length > 0) {
			// A leaf with our view already exists, switch focus to that view.
			leaf = leaves[0];
		} else {
			// Create a new leaf with our view in the right sidebar.
			leaf = workspace.getRightLeaf(false);
			leaf?.setViewState({
				type: VIEW_TYPE_DABIN_CALENDAR,
				active: true,
			});
		}
		if (leaf) {
			workspace.revealLeaf(leaf);
		} else {
			console.error(
				"Failed to create or find a leaf for the Dabin Calendar view."
			);
		}
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: DabinCalendarPlugin;

	constructor(app: App, plugin: DabinCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
