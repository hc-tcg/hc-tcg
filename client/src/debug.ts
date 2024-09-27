import {DEBUG} from 'common/config'

const urlParams = new URLSearchParams(window.location.search)

const debugOptions = {
	/** Show the update modal automatically when the user logs in */
	showUpdatesModal: true,
}

if (DEBUG) {
	if (JSON.parse(urlParams.get('showUpdatesModal') || '') == 'false') {
		debugOptions.showUpdatesModal = false
	}
}

export default debugOptions
