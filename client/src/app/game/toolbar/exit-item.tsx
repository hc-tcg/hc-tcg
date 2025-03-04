import {getOpenedModal} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function ExitItem({
	gameOver,
	gameEndButton,
}: {gameOver: boolean; gameEndButton: () => void}) {
	const dispatch = useMessageDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleExit = () => {
		if (gameOver) {
			gameEndButton()
			return
		}
		if (!openedModal)
			dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: 'exit'})
	}

	return (
		<button className={css.item} title="Exit" onClick={handleExit}>
			<img src="/images/toolbar/exit.png" height="30" />
		</button>
	)
}

export default ExitItem
