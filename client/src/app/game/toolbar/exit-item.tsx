import {getOpenedModal} from 'logic/game/game-selectors'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'
import {localMessages, useMessageDispatch} from 'logic/messages'

function ExitItem() {
	const dispatch = useMessageDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleExit = () => {
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
