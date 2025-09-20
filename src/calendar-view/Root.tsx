import { useState } from "react";
import "./root.css";
import { useApp } from "@/hooks/useApp";
import { Slider } from "@/components/ui/slider";

export const CalendarViewRoot = () => {
	const app = useApp();

	// Get active file.
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		return <div>No active file</div>;
	}

	// Get dataview api.
	// @ts-ignore
	const dv: any = app.plugins.plugins.dataview.api as DataviewPageApi;
	const page = dv.page(`${activeFile.path}`);
	console.log("PAGE: ", page);
	const file = page?.file;
	console.log("FILE: ", file);
	const lists = file?.lists;

	console.log("LISTS: ", lists);
	if (lists) {
		for (const list of lists) {
			console.log("LIST: ", list);
		}
	}

	const [colNum, setColNum] = useState(1);

	return (
		<div className="p-4">
			<h4>Hello {activeFile.basename}!</h4>
			<Slider
				className="mb-4"
				value={[colNum]}
				onValueChange={(value) => setColNum(value[0])}
			/>
			<div className="border rounded-md p-2">
				{Array.from({ length: colNum }).map((_, index) => (
					<div key={index} className="border rounded-md p-2">
						{index}
					</div>
				))}
			</div>
		</div>
	);
};
