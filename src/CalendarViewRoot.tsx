import "./calendar-view.css";
import { useApp } from "./hooks/useApp";

export const CalendarViewRoot = () => {
	const { vault } = useApp();

	return (
		<div className="p-4">
			<h4>Hello {vault?.getName()}!</h4>
			<div className="border rounded-md p-2">yes</div>
		</div>
	);
};
