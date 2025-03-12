import {serverMessages} from 'common/socket-messages/server-messages'
import root from 'serverRoot'
import {broadcast} from 'utils/comm'
import {z} from 'zod'

export let UpdateMessage = z.object({version: z.string()})

export function updateWarning(version: string) {
	broadcast(Object.values(root.players), {
		type: serverMessages.TOAST_SEND,
		title: 'Server Restart Warning',
		description: `The server is going to be updated in 15 minutes to version ${version}. Please finish your games.`,
		image: 'images/icons/warning_icon.png',
	})
	setTimeout(
		() => {
			broadcast(Object.values(root.players), {
				type: serverMessages.TOAST_SEND,
				title: 'Server Restart Warning',
				description: `The server is going to be updated in 5 minutes to version ${version}. Please finish your games.`,
				image: 'images/icons/warning_icon.png',
			})
		},
		60 * 10 * 1000,
	)
	setTimeout(
		() => {
			broadcast(Object.values(root.players), {
				type: serverMessages.TOAST_SEND,
				title: 'Server Restart Warning',
				description: `The server is going to be updated in under one minute to version ${version}. Please finish your games.`,
				image: 'images/icons/warning_icon.png',
			})
		},
		60 * 14 * 1000,
	)
}
