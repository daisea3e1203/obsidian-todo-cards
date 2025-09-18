import { App } from "obsidian";
import { createContext } from "react";

export const CalendarViewContext = createContext<
	CalendarViewContextType | undefined
>(undefined);

export type CalendarViewContextType = {
	app: App;
};
