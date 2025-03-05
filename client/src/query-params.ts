import {DEBUG} from 'common/config'

const urlParams = new URLSearchParams(window.location.search)

type QueryOptions = {
	/** Show the update modal automatically when the user logs in */
	showUpdatesModal: boolean
	/** Query Params to bring the player straight to a game */
	spectate?: string
	fight?: string
}

const queryOptions: QueryOptions = {
	showUpdatesModal: true,
}

if (DEBUG) {
	if (JSON.parse(urlParams.get('showUpdatesModal') || '{}') === false) {
		queryOptions.showUpdatesModal = false
	}
}

if (urlParams.get('spectate')) {
	queryOptions.spectate = urlParams.get('spectate') ?? undefined
}
if (urlParams.get('fight')) {
	queryOptions.fight = urlParams.get('fight') ?? undefined
}

console.log(urlParams)

export default queryOptions
