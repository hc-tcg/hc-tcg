import {getOpenedModal} from 'logic/game/game-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './toolbar.module.scss'
import {actions} from 'logic/actions'

function ForfeitItem() {
	const dispatch = useDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleForfeit = () => {
		if (!openedModal)
			dispatch({type: actions.GAME_MODAL_OPENED_SET, id: 'forfeit'})
	}

	return (
		<button className={css.item} title="Forfeit" onClick={handleForfeit}>
			<img src="/images/toolbar/banner.png" height="30" />
		</button>
	)
}

export default ForfeitItem
