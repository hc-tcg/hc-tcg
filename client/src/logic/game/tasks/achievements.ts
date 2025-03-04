import { ACHIEVEMENTS } from 'common/achievements'
import { ALL_COSMETICS } from 'common/cosmetics'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, localMessages} from 'logic/messages'
import {receiveMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {call, put, select} from 'typed-redux-saga'

function* achievementSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.ACHIEVEMENT_COMPLETE),
		)
        const {achievementId, level, newProgress} = result.achievement
		
        const iconCosmetic = ALL_COSMETICS.find(
            (x) =>
                x.requires?.achievement === ACHIEVEMENTS[achievementId].id &&
                (x.requires.level === level.index || !x.requires.level),
        )

        let icon_url = undefined

		if (iconCosmetic && iconCosmetic.type === 'title') {
			icon_url = '/images/cosmetics/title.png'
		} else if (iconCosmetic) {
			icon_url = `/images/cosmetics/${iconCosmetic.type}/${iconCosmetic.type === 'background' && iconCosmetic.preview ? iconCosmetic.preview : iconCosmetic.id}.png`
		}

        yield* put<LocalMessage>({
			type: localMessages.TOAST_OPEN,
            open: true,
			title: 'Achievement Complete!',
            description: `Completed ${level.name} (${newProgress}/${level.steps})`,
            image: icon_url
        })
	}
}

export default achievementSaga
