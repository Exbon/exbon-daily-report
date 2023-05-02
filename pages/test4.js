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
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (view === 'Day') {
			/* 1. Highlight only weekends */
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

			/* 2. Change column header text. ex) Sat, 15 -> 15 */
			// setTimeout(() => {
			// 	let elementsOfCalendar = document.getElementsByClassName('_9w8d5');
			// 	for (let i = 0; i < elementsOfCalendar.length; i++) {
			// 		elementsOfCalendar[i].innerHTML = elementsOfCalendar[i].innerHTML
			// 			.substring(4)
			// 			.trim();
			// 	}
			// }, 1);

			/* 3. Change bar thickness */
			if (!isInitialized) {
				// tags structure
				// .....
				// <g class="_KxSXS">
				// 	<g>
				// 		<rect></rect> (total)
				// 		<rect></rect> (filled)
				// 	</g>
				// 	<g></g> (useless)
				// </g>;
				let barClass = document.getElementsByClassName('_KxSXS');

				setTimeout(() => {
					for (let i = 0; i < barClass.length; i++) {
						for (
							let j = 0;
							j < barClass[i].childNodes[0].children.length;
							j++
						) {
							barClass[i].childNodes[0].children[j].setAttribute(
								'height',
								parseInt(
									barClass[i].childNodes[0].children[j].getAttribute('height'),
								) - 8,
							);

							// The y value should be increased by dividing the reduced height by 2. ex: height -= 8 , then y += 4
							barClass[i].childNodes[0].children[j].setAttribute(
								'y',
								parseInt(
									barClass[i].childNodes[0].children[j].getAttribute('y'),
								) + 4,
							);
						}
					}
				}, 1);
				setIsInitialized(true);
			}
		} else {
			/* remove highlights for weekends */
			document.querySelectorAll('.weekend').forEach((el) => el.remove());
		}
	}, [view]);

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
				barCornerRadius={10}
				rowHeight={40}
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
