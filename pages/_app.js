import '../styles.css';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useStore } from '../store';
import theme from '../src/theme';
import Modal from 'react-modal';
import React from 'react';

import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';

Modal.setAppElement('#modalForTasksTab');

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
	const store = useStore(pageProps.initialReduxState);
	React.useEffect(() => {
		// Remove the server-side injected CSS.
		const jssStyles = document.querySelector('#jss-server-side');
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles);
		}
	}, []);

	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
				{/* <CssBaseline /> */}
				<Component {...pageProps} />
				<div id="modalForTasksTab"></div>
			</ThemeProvider>
		</Provider>
	);
}
