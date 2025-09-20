import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { CalendarViewRoot } from "./Root";

import { ObsidianContext } from "../hooks/ObsidianContext";

export const VIEW_TYPE_DABIN_CALENDAR = "dabin-calendar-view";

export class DabinCalendarView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
	getViewType(): string {
		return VIEW_TYPE_DABIN_CALENDAR;
	}
	getDisplayText(): string {
		return "Dabin Calendar";
	}

	protected async onOpen(): Promise<void> {
		this.root = createRoot(this.containerEl);

		// Render after dataview index is ready.

		this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf) => {
			// @ts-ignore
			console.log("Active leaf changed to file:", leaf.view?.file?.path);
			this.render();
		});

		this.registerEvent(
			// @ts-ignore
			this.app.metadataCache.on("dataview:index-ready", (file: TFile) => {
				console.log("Dataview index ready for file:", file?.path);
				this.render();
			})
		);
	}

	render() {
		if (!this.root) {
			console.warn("React root not ready.");
			return;
		}
		this.root.render(
			<StrictMode>
				<ObsidianContext.Provider value={{ app: this.app }}>
					<CalendarViewRoot />
				</ObsidianContext.Provider>
			</StrictMode>
		);
	}

	async onClose(): Promise<void> {
		this.root?.unmount();
	}
}
