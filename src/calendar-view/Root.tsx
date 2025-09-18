import { useState } from "react";
import "./root.css";
import { useApp } from "@/hooks/useApp";

export const CalendarViewRoot = () => {
	const { vault } = useApp();

	const [colNum, setColNum] = useState(1);

	return (
		<div className="p-4">
			<h4>Hello {vault?.getName()}!</h4>
			<div className="border rounded-md p-2">
				{Array.from({ length: colNum }).map((_, index) => (
					<div key={index} className="border rounded-md p-2">
						{index}
					</div>
				))}
			</div>
			<input
				type="number"
				value={colNum}
				onChange={(e) => setColNum(Number(e.target.value))}
			/>
		</div>
	);
};
