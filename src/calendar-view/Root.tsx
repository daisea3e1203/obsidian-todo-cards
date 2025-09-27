import "./root.css";
import { useApp } from "@/hooks/useApp";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";
import { SquareCheckIcon, SquareIcon } from "lucide-react";
import { TFile } from "obsidian";
import { Fragment, useMemo } from "react";

const updateDateFieldInDoc = async (
	app: any,
	file: TFile,
	lineNumber: number,
	fieldType: string,
	newDate: Date
) => {
	try {
		const content = await app.vault.read(file);
		const lines = content.split("\n");

		if (lineNumber >= 0 && lineNumber < lines.length) {
			const line = lines[lineNumber];
			const formattedDate = newDate.toISOString().split("T")[0];
			const fieldPattern = new RegExp(
				`\\[${fieldType}::\\s*\\d{4}-\\d{2}-\\d{2}\\]`
			);

			let updatedLine: string;
			if (fieldPattern.test(line)) {
				// Update existing field
				updatedLine = line.replace(
					fieldPattern,
					`[${fieldType}::${formattedDate}]`
				);
			} else {
				// Add new field at the end of the line
				updatedLine =
					line.trimEnd() + ` [${fieldType}::${formattedDate}]`;
			}

			lines[lineNumber] = updatedLine;
			const newContent = lines.join("\n");
			await app.vault.modify(file, newContent);
		}
	} catch (error) {
		console.error("Error updating date field:", error);
	}
};

const updateCheckFieldInDoc = async (
	app: any,
	file: TFile,
	lineNumber: number,
	newCheck: boolean
) => {
	try {
		const content = await app.vault.read(file);
		const lines = content.split("\n");

		if (lineNumber >= 0 && lineNumber < lines.length) {
			const line = lines[lineNumber];
			const fieldPattern = new RegExp(`- \\[( |x)\\]`);

			let updatedLine: string | undefined;
			if (fieldPattern.test(line)) {
				// Update existing field
				updatedLine = line.replace(
					fieldPattern,
					`- [${newCheck ? "x" : " "}]`
				);
			}

			lines[lineNumber] = updatedLine ?? line;
			const newContent = lines.join("\n");
			await app.vault.modify(file, newContent);
		}
	} catch (error) {
		console.error("Error updating date field:", error);
	}
};

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
	const file = page?.file;
	const lists = file?.lists;

	for (const list of lists.values as ObsidianList[]) {
		if (list.text.includes("案出し")) {
			console.log("LIST: ", list);
		}
	}

	// Create initial state.
	if (!lists) {
		return <div>No lists found in the file.</div>;
	}

	const dates = lists.values
		.map((list: ObsidianList) => {
			return [list.due?.toJSDate(), list.scheduled?.toJSDate()];
		})
		.flat()
		.filter((date: Date | undefined) => date !== undefined);
	// const activeDates = [...dates, new Date()]
	const dateLabels = dates.map((date: Date) => {
		return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
	});
	const activeDates = dates
		.filter(
			(date: Date, index: number) =>
				dateLabels.indexOf(
					DateTime.fromJSDate(date).toFormat("yyyy-MM-dd")
				) === index
		) // Remove duplicates
		.sort((a: Date, b: Date) => a.getTime() - b.getTime());

	return (
		<div className="h-full w-full overflow-auto dark p-4">
			<div className={cn("gap-2 grid")}>
				{activeDates.map((date: Date, i: number) => {
					return (
						<DayTile
							key={i.toString()}
							lists={lists}
							date={date}
							app={app}
							activeFile={activeFile}
						/>
					);
				})}
			</div>

			<div className="border-b my-4" />

			<DayTile
				// lists={unscheduledItems}
				lists={lists}
				app={app}
				activeFile={activeFile}
			/>
		</div>
	);
};

type ObsidianList = {
	line: number; // The line number of the list in the file.
	list: number; // The line number of the uppermost ancestor list item.
	parent: number; // The line number of the parent list item.
	text: string; // The text of the list item.
	checked?: boolean; // Whether the list item is checked.
	completed?: boolean; // Whether the list item is completed.
	completion?: DateTime; // The date of the completion of the list item.
	scheduled?: DateTime; // The date of the scheduled of the list item.
	due?: DateTime; // The date of the due of the list item.
};

function DayTile(props: {
	lists: ObsidianList[];
	date?: Date;
	app: any;
	activeFile: TFile;
}) {
	const label = useMemo(() => {
		if (!props.date) {
			return "Unscheduled";
		}

		const yyyy = props.date.getFullYear();
		const mm = String(props.date.getMonth() + 1).padStart(2, "0");
		const dd = String(props.date.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}`;
	}, [props.date]);

	// Filter lists.
	const lists = props.lists
		.filter((list) => {
			const dates = [list.due, list.scheduled];

			// Unscheduled items are always included.
			if (!props.date) {
				if (
					!list.scheduled &&
					!list.due &&
					list.checked !== undefined
				) {
					return true;
				} else {
					return false;
				}
			}

			// If the date is provided, only include matching items.
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
				isDue: list.due && list.due.toFormat("yyyy-MM-dd") === label,
			};
		});

	const weekday = props.date
		?.toLocaleDateString(undefined, { weekday: "long" })
		.slice(0, 3);

	const isToday =
		props.date &&
		DateTime.fromJSDate(props.date).toFormat("yyyy-MM-dd") ===
			DateTime.fromJSDate(new Date()).toFormat("yyyy-MM-dd");

	return (
		<>
			<div
				className={cn("border rounded-md p-2")}
				style={{
					borderColor: isToday ? "#f0f0f0" : undefined,
				}}
			>
				<div className="flex justify-between">
					<p className="font-bold">{label}</p>
					<p className="text-sm text-gray-500">{weekday}</p>
				</div>
				<div className="mt-2 flex flex-col gap-2">
					{lists.length === 0 && (
						<p className="text-sm text-gray-500">No items</p>
					)}
					{lists.map((list, i) => {
						const parent = props.lists.find(
							(l) => l.line === list.parent
						);
						return (
							<div
								key={i.toString()}
								className="flex flex-col gap-1"
							>
								<div className="flex justify-between flex-wrap">
									{parent && (
										<p className="text-sm text-gray-500">
											{parent.text}
										</p>
									)}
									<div className="flex gap-2">
										{[
											{
												label: "Sched",
												value: list.scheduled,
												fieldType: "scheduled",
											},
											{
												label: "Due",
												value: list.due,
												fieldType: "due",
											},
										].map(
											(
												{ label, value, fieldType },
												i
											) => {
												return (
													<Tag
														key={i.toString()}
														title={label}
														value={value}
														list={list}
														fieldType={fieldType}
														app={props.app}
														activeFile={
															props.activeFile
														}
													/>
												);
											}
										)}
									</div>
								</div>

								<p
									className={cn(
										"flex gap-1 items-start",
										list.isDue && "text-violet-400"
									)}
								>
									<span
										className="mt-[1px] cursor-pointer"
										onClick={() => {
											if (
												list &&
												props.app &&
												props.activeFile
											) {
												updateCheckFieldInDoc(
													props.app,
													props.activeFile,
													list.line,
													!list.completed
												);
											}
										}}
									>
										{list.completed ? (
											<SquareCheckIcon className="size-4" />
										) : (
											<SquareIcon className="size-4" />
										)}
									</span>
									<span className={cn("cursor-pointer")}>
										{list.text
											.split("\n")
											.map((line, idx, arr) => (
												<Fragment key={idx.toString()}>
													{line}
													{idx < arr.length - 1 && (
														<br />
													)}
												</Fragment>
											))}
									</span>
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

function Tag(props: {
	title: string;
	value?: DateTime;
	onClick?: () => void;
	list?: ObsidianList;
	fieldType?: string;
	app?: any;
	activeFile?: TFile;
}) {
	const { title, value, onClick, list, fieldType, app, activeFile } = props;

	const handleClick = async (date: Date) => {
		if (onClick) {
			onClick();
		}

		if (list && fieldType && app && activeFile) {
			const nextDay = DateTime.fromJSDate(date).plus({ hours: 9 });
			await updateDateFieldInDoc(
				app,
				activeFile,
				list.line,
				fieldType,
				nextDay.toJSDate()
			);
		}
	};

	return (
		<div className="flex gap-2 items-center">
			<p className="text-sm text-gray-500">
				{title}: {value?.toFormat("yyyy-MM-dd") || "..."}
			</p>

			<DatePicker
				date={value?.toJSDate() || new Date()}
				setDate={handleClick}
			/>
		</div>
	);
}
