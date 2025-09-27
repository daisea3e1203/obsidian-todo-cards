import { useState } from "react";
import "./root.css";
import { useApp } from "@/hooks/useApp";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import {
	Columns2Icon,
	Rows2Icon,
	SquareCheckIcon,
	SquareIcon,
} from "lucide-react";

type Layout = "vertical" | "horizontal";

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
	const [colNum] = useState(14);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const [date, setDate] = useState<Date>(yesterday);
	const [layout, setLayout] = useState<Layout>("vertical");

	if (!lists) {
		return <div>No lists found in the file.</div>;
	}

	return (
		<div className="h-full w-full overflow-auto dark p-4">
			{/* <h4>Tasks from {activeFile.basename}</h4> */}
			<div className="flex gap-4">
				<DatePicker date={date} setDate={setDate} />
				<Select
					value={layout}
					onValueChange={(value) => setLayout(value as Layout)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select layout" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="vertical">
							<Rows2Icon />
						</SelectItem>
						<SelectItem value="horizontal">
							<Columns2Icon />
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="h-4" />

			{/* <div className="flex gap-4 items-center justify-center h-12"> */}
			{/* <div>{colNum}</div> */}
			{/* <Slider
					value={[colNum]}
					max={14}
					min={1}
					onValueChange={(value) => setColNum(value[0])}
				/> */}
			{/* </div> */}
			<div
				className={cn(
					"gap-2",
					layout === "vertical" && "grid",
					layout === "horizontal" &&
						"grid grid-flow-col auto-cols-[160px]"
				)}
			>
				{Array.from({ length: colNum }).map((_, index) => {
					const day = new Date(date);
					day.setDate(date.getDate() + index);
					return (
						<DayTile
							key={day.toISOString()}
							day={day}
							lists={lists}
							layout={layout}
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

function DayTile(props: { day: Date; lists: ObsidianList[]; layout: Layout }) {
	const { day } = props;
	const yyyy = day.getFullYear();
	const mm = String(day.getMonth() + 1).padStart(2, "0");
	const dd = String(day.getDate()).padStart(2, "0");
	const label = `${yyyy}-${mm}-${dd}`;

	// Filter lists.
	const lists = props.lists
		.filter((list) => {
			const dates = [list.due, list.completion, list.scheduled];
			for (const date of dates) {
				if (
					date &&
					date.toFormat &&
					date.toFormat("yyyy-MM-dd") === label
				) {
					return true;
				}
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

	const weekday = day
		.toLocaleDateString(undefined, { weekday: "long" })
		.slice(0, 3);

	return (
		<>
			<div className="border rounded-md p-2">
				<div className="flex justify-between">
					<p className="font-bold">{label}</p>
					<p className="text-sm text-gray-500">{weekday}</p>
				</div>
				<div className="mt-2 flex flex-col gap-2">
					{lists.map((list) => {
						const parent = props.lists.find(
							(l) => l.line === list.parent
						);
						// console.log("PARENT: ", parent);
						return (
							<div
								key={list.line}
								className="flex flex-col gap-1"
							>
								<div className="flex justify-between">
									{parent && (
										<p className="text-sm text-gray-500">
											{parent.text}
										</p>
									)}
									{props.layout === "vertical" && (
										<div className="flex gap-2">
											{[
												{
													label: "Scheduled",
													value: list.scheduled,
												},
												{
													label: "Due",
													value: list.due,
												},
												{
													label: "Completed",
													value: list.completion,
												},
											].map(({ label, value }) => {
												if (value && value.toFormat) {
													return (
														<Tag
															key={label}
															title={label}
															value={value.toFormat(
																"yyyy-MM-dd"
															)}
														/>
													);
												}
												return null;
											})}
										</div>
									)}
								</div>

								<p className="flex gap-1 items-center">
									<span>
										{list.completed ? (
											<SquareCheckIcon className="size-4" />
										) : (
											<SquareIcon className="size-4" />
										)}
									</span>
									<span>{list.text}</span>
								</p>
								<p className="flex gap-4"></p>
							</div>
						);
					})}
				</div>
			</div>
			{weekday === "Sun" && <div className="border-b my-4" />}
		</>
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
