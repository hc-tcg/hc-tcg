import React from 'react'
import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import './index.scss'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'
import App from './app'
import store from './store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Make the store available in the playwright test.
// @ts-ignore
global.getState = () => store.getState()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
)
