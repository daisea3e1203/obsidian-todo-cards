import { useContext } from "react";
import { CalendarViewContext } from "src/CalendarViewContext";

export const useApp = () => {
	const context = useContext(CalendarViewContext);
	if (!context) {
		throw new Error("useApp must be used within a CalendarViewContext");
	}
	return context.app;
};
