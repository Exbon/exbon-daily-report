import { useEffect, useState } from 'react';

export const test = () => {
	const [count, setCount] = useState(0);

	const handleIncrement = () => {
		setCount((prevCount) => prevCount + 1);
	};

	useEffect(() => {
		console.log('State updated using setCount function');
	}, [count]);

	return (
		<div>
			<p>You clicked {count} times</p>
			<button onClick={handleIncrement}>Click me</button>
		</div>
	);
};
export default test;
