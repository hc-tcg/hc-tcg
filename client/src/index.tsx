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
import {CARDS_LIST} from 'common/cards'
import {getRenderedCardImage} from 'common/cards/card'
import App from './app'
import store from './store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Make the store available in the playwright test.
// @ts-ignore
global.getState = () => store.getState()

let preloadCards = CARDS_LIST.flatMap((card) => {
	return [
		<link rel="prerender" href={getRenderedCardImage(card, true)} />,
		<link rel="prerender" href={getRenderedCardImage(card, false)} />,
	]
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
	<React.StrictMode>
		{preloadCards}
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
)
