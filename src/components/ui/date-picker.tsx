"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker(props: {
	date: Date;
	setDate: (date: Date) => void;
}) {
	const { date, setDate } = props;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					data-empty={!date}
					size="icon"
					className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal size-6"
					style={{
						width: "24px",
						height: "24px",
						backgroundColor: "transparent",
					}}
				>
					<CalendarIcon className="size-4 text-gray-500" />
					{/* {date ? format(date, "PPP") : <span>Pick a date</span>} */}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="dark w-auto p-0">
				<Calendar
					mode="single"
					numberOfMonths={2}
					selected={date}
					onSelect={setDate}
				/>
			</PopoverContent>
		</Popover>
	);
}
