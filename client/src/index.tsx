import React from 'react'
import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import './index.scss'
import App from './app'

import * as Toast from '@radix-ui/react-toast'
import toastCSS from 'components/toast/toast.module.scss'
import store from './store'

// Make the store available in the playwright test.
// @ts-ignore
global.store = store

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<Toast.Provider swipeDirection="right">
				<Toast.Viewport className={toastCSS.viewport} />
				<App />
			</Toast.Provider>
		</Provider>
	</React.StrictMode>,
)
