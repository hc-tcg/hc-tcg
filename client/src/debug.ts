import { DEBUG } from "common/config"

const urlParams = new URLSearchParams(window.location.search)

const debugOptions = {
	/** Show the update modal automatically when the user logs in */
	showUpdateModal: true,
}

if (DEBUG) {
	if (JSON.parse(urlParams.get('showUpdateModal') || '') == 'false') {
		debugOptions.showUpdateModal = false
	}
}


export default debugOptions
