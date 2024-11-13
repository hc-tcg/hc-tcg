import React from 'react'
import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import './index.scss'
import {CARDS_LIST} from 'common/cards'
import {getRenderedCardImage} from 'common/cards/card'
import App from './app'
import store from './store'

// Make the store available in the playwright test.
// @ts-ignore
global.getState = () => store.getState()

let preloadCards = CARDS_LIST.flatMap((card) => {
	return [
		<link rel="preload" href={getRenderedCardImage(card, true)} as="image" />,
		<link rel="preload" href={getRenderedCardImage(card, false)} as="image" />,
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
