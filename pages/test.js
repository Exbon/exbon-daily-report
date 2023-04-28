import { useEffect, useState } from 'react';
import {
	Gantt,
	Task,
	EventOption,
	StylingOption,
	ViewMode,
	DisplayOption,
} from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

export const test = () => {
	const [view, setView] = useState('Day');

	useEffect(() => {
		if (view === 'Day') {
			let elementsOfGridBody = document.getElementsByClassName('gridBody');

			const test = getWeekendDays(
				tasks[0].start,
				tasks[tasks.length - 1].end,
			).map((day) => {
				return `<g class="weekend"><rect x=${
					day.index * 60
				} y="0" width="60" height="200" fill="rgba(210, 215, 211, 0.5)"></rect></g>`;
			});

			elementsOfGridBody[0].innerHTML += test;

			console.log(elementsOfGridBody[0].innerHTML);
		} else {
			document.querySelectorAll('.weekend').forEach((el) => el.remove());
		}
	}, [view]);

	useEffect(() => {
		let elementsOfCalendar = document.getElementsByClassName('calendar');

		// ! Sat, 15 -> 15
		// elementsOfCalendar[0].innerHTML = elementsOfCalendar[0].innerHTML
		// 	.replace(/Mon, /g, '')
		// 	.replace(/Tue, /g, '')
		// 	.replace(/Wed, /g, '')
		// 	.replace(/Thu, /g, '')
		// 	.replace(/Fri, /g, '')
		// 	.replace(/Sat, /g, '')
		// 	.replace(/Sun, /g, '');
	}, []);

	let tasks = [
		{
			start: new Date(2023, 3, 1),
			end: new Date(2023, 3, 5),
			name: 'Task 1',
			id: 'Task 1',
			type: 'task',
			progress: 100,
			isDisabled: true,
			styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
		},
		{
			start: new Date(2023, 3, 5),
			end: new Date(2023, 3, 10),
			name: 'Task 2',
			id: 'Task 2',
			type: 'task',
			progress: 35,
			isDisabled: true,
			styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
			dependencies: ['Task 1'],
		},
		{
			start: new Date(2023, 3, 4),
			end: new Date(2023, 3, 17),
			name: 'Task 3',
			id: 'Task 3',
			type: 'task',
			progress: 55,
			isDisabled: true,
			styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
			dependencies: ['Task 1'],
		},
		{
			start: new Date(2023, 3, 17),
			end: new Date(2023, 5, 22),
			name: 'Task 4',
			id: 'Task 4',
			type: 'task',
			progress: 0,
			isDisabled: true,
			styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
			dependencies: ['Task 3'],
		},
	];

	function getWeekendDays(startDate, endDate) {
		const startOfYear = startDate.getFullYear();
		const startOfMonth = startDate.getMonth();
		const startOfDate = startDate.getDate();
		const firstDayOfMonth = new Date(startOfYear, startOfMonth, startOfDate);
		const endOfYear = endDate.getFullYear();
		const endOfMonth = endDate.getMonth();
		const endOfDate = endDate.getDate();
		const lastDayOfMonth = new Date(endOfYear, endOfMonth + 1, endOfDate);

		const weekendDays = [];
		let currentDate = firstDayOfMonth;

		while (currentDate <= lastDayOfMonth) {
			const dayOfWeek = currentDate.getDay();
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				const daysSinceStartDate = Math.floor(
					(currentDate - startDate) / (1000 * 60 * 60 * 24),
				);
				const weekendDay = {
					date: currentDate.toLocaleDateString('en-US'),
					dayOfWeek: dayOfWeek === 0 ? 'Sunday' : 'Saturday',
					index: daysSinceStartDate + 1,
				};
				weekendDays.push(weekendDay);
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return weekendDays;
	}

	return (
		<>
			<Gantt
				tasks={tasks}
				TooltipContent={() => {
					return '';
				}}
				viewMode={view}
				listCellWidth=""
				columnWidth={60}
				TaskListHeader={() => {
					return '';
				}}
				style={{
					display: 'relative',
				}}
				className="gantt"
			/>
			<div>
				<button
					onClick={() => setView('Day')}
					disabled={view === 'Day' ? true : false}
				>
					Day
				</button>
				<button
					onClick={() => setView('Week')}
					disabled={view === 'Week' ? true : false}
				>
					Week
				</button>
			</div>
		</>
	);
};
export default test;
