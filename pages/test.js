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
			end: new Date(2023, 3, 22),
			name: 'Task 4',
			id: 'Task 4',
			type: 'task',
			progress: 0,
			isDisabled: true,
			styles: {
				progressColor: '#ffbb54',
				progressSelectedColor: '#ff9e0d',
				barCornerRadius: 1,
			},
			dependencies: ['Task 3'],
		},
	];

	return (
		<Gantt
			tasks={tasks}
			TooltipContent={() => {
				return '';
			}}
			viewMode="Day"
			listCellWidth=""
			columnWidth={60}
			TaskListHeader={() => {
				return '';
			}}
		/>
	);
};
export default test;
