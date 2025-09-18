import { App } from "obsidian";
import { createContext } from "react";

export const ObsidianContext = createContext<ObsidianContextType | undefined>(
	undefined
);

export type ObsidianContextType = {
	app: App;
};
