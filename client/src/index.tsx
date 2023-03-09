import React from 'react'
import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import './index.scss'
import App from './app'

import socket from './socket'
import store from './store'

// @ts-ignore
global.store = store
// @ts-ignore
global.socket = socket

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>
)
