import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { CalendarViewRoot } from "./CalendarViewRoot";
import { CalendarViewContext } from "./CalendarViewContext";

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
		this.root.render(
			<StrictMode>
				<CalendarViewContext.Provider value={{ app: this.app }}>
					<CalendarViewRoot />
				</CalendarViewContext.Provider>
			</StrictMode>
		);
	}

	async onClose(): Promise<void> {
		this.root?.unmount();
	}
}
