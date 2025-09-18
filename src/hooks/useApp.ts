import { useContext } from "react";
import { ObsidianContext } from "./ObsidianContext";

export const useApp = () => {
	const context = useContext(ObsidianContext);
	if (!context) {
		throw new Error("useApp must be used within a CalendarViewContext");
	}
	return context.app;
};
