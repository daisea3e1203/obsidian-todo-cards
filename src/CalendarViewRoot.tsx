import { useApp } from "./hooks/useApp";

export const CalendarViewRoot = () => {
	const { vault } = useApp();

	return <h4>Hello {vault?.getName()}!</h4>;
};
