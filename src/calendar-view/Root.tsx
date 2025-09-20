import { useState } from "react";
import "./root.css";
import { useApp } from "@/hooks/useApp";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTime } from "luxon";

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
	// console.log("PAGE: ", page);
	const file = page?.file;
	// console.log("FILE: ", file);
	const lists = file?.lists;
	// console.log("LISTS: ", lists);
	// if (lists) {
	// 	for (const list of lists) {
	// 		console.log("LIST: ", list);
	// 	}
	// }

	// Create initial state.
	const [colNum, setColNum] = useState(5);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const [date, setDate] = useState<Date>(yesterday);

	if (!lists) {
		return <div>No lists found in the file.</div>;
	}

	return (
		<div className="h-full overflow-y-auto dark p-4">
			{/* <h4>Tasks from {activeFile.basename}</h4> */}
			<DatePicker date={date} setDate={setDate} />

			<div className="flex gap-4 items-center justify-center h-12">
				<div>{colNum}</div>

				<Slider
					value={[colNum]}
					max={14}
					min={1}
					onValueChange={(value) => setColNum(value[0])}
				/>
			</div>
			<div className="grid gap-2">
				{Array.from({ length: colNum }).map((_, index) => {
					const day = new Date(date);
					day.setDate(date.getDate() + index);
					return (
						<DayTile
							key={day.toISOString()}
							day={day}
							lists={lists}
						/>
					);
				})}
			</div>
		</div>
	);
};

type ObsidianList = {
	line: number; // The line number of the list in the file.
	list: number; // The line number of the uppermost ancestor list item.
	parent: number; // The line number of the parent list item.
	text: string; // The text of the list item.
	completed?: boolean; // Whether the list item is completed.
	completion?: DateTime; // The date of the completion of the list item.
	scheduled?: DateTime; // The date of the scheduled of the list item.
	due?: DateTime; // The date of the due of the list item.
};

function DayTile(props: { day: Date; lists: ObsidianList[] }) {
	const { day } = props;
	const yyyy = day.getFullYear();
	const mm = String(day.getMonth() + 1).padStart(2, "0");
	const dd = String(day.getDate()).padStart(2, "0");
	const label = `${yyyy}-${mm}-${dd}`;

	// Filter lists.
	const lists = props.lists
		.filter((list) => {
			if (list.due && list.due.toFormat("yyyy-MM-dd") === label) {
				return true;
			} else if (
				list.completion &&
				list.completion.toFormat("yyyy-MM-dd") === label
			) {
				return true;
			} else if (
				list.scheduled &&
				list.scheduled.toFormat("yyyy-MM-dd") === label
			) {
				return true;
			}
			return false;
		})
		.map((list) => {
			// Remove the date information from the text.
			const trimmedText = list.text
				.replace(/\[\w+::\s*\d{4}-\d{2}-\d{2}\]/g, "")
				.trim();
			return {
				...list,
				text: trimmedText,
			};
		});

	return (
		<div className="border rounded-md p-2">
			<p className="font-bold">{label}</p>
			<div className="mt-2 flex flex-col gap-2">
				{lists.map((list) => {
					const parent = props.lists.find(
						(l) => l.line === list.parent
					);
					// console.log("PARENT: ", parent);
					return (
						<div key={list.line} className="flex flex-col gap-2">
							<div className="flex justify-between">
								{parent && (
									<p className="text-sm text-gray-500">
										{parent.text}
									</p>
								)}
								<div className="flex gap-2">
									{list.scheduled && (
										<Tag
											title="Scheduled"
											value={list.scheduled.toFormat(
												"yyyy-MM-dd"
											)}
										/>
									)}
									{list.due && (
										<Tag
											title="Due"
											value={list.due.toFormat(
												"yyyy-MM-dd"
											)}
										/>
									)}
									{list.completion && (
										<Tag
											title="Completed"
											value={list.completion.toFormat(
												"yyyy-MM-dd"
											)}
										/>
									)}
								</div>
							</div>

							<p>
								<span>{list.completed ? "✅" : "❌"}</span>
								<span>{list.text}</span>
							</p>
							<p className="flex gap-4"></p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Tag(props: { title: string; value: string }) {
	const { title, value } = props;
	return (
		<p className="text-sm text-gray-500">
			{title}: {value}
		</p>
	);
}
