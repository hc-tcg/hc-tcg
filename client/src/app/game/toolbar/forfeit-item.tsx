import {getOpenedModal} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function ForfeitItem() {
	const dispatch = useMessageDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleForfeit = () => {
		if (!openedModal)
			dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: 'forfeit'})
	}

	return (
		<button className={css.item} title="Forfeit" onClick={handleForfeit}>
			<img src="/images/toolbar/banner.png" height="30" />
		</button>
	)
}

export default ForfeitItem
