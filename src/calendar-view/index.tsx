import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { CalendarViewRoot } from "./Root";

import { ObsidianContext } from "../hooks/ObsidianContext";

export const VIEW_TYPE_DABIN_CALENDAR = "dabin-calendar-view";

export class DabinCalendarView extends ItemView {
	root: Root | null = null;
	debouncedRenderTimeout: NodeJS.Timeout | null = null;

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

		// this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf) => {
		// 	// @ts-ignore
		// 	console.log("Active leaf changed to file:", leaf.view?.file?.path);
		// 	this.render();
		// });

		// @ts-ignore
		// this.app.workspace.on("editor-change", (file: TFile) => {
		// 	console.log("File modified:", file?.path);
		// 	this.debouncedRender();
		// });

		// Render after dataview index is ready.
		this.registerEvent(
			// @ts-ignore
			this.app.metadataCache.on("dataview:index-ready", (file: TFile) => {
				console.log("Dataview index ready for file:", file?.path);
				this.render();
			})
		);

		// Render after dataview changes.
		this.registerEvent(
			this.app.metadataCache.on(
				// @ts-ignore
				"dataview:metadata-change",
				(file: TFile) => {
					console.log(
						"Dataview metadata changed for file:",
						file?.path
					);
					this.render();
				}
			)
		);
	}

	debouncedRender() {
		if (this.debouncedRenderTimeout) {
			clearTimeout(this.debouncedRenderTimeout);
		}
		this.debouncedRenderTimeout = setTimeout(() => {
			console.log("Debounced render.");
			this.render();
		}, 500);
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
