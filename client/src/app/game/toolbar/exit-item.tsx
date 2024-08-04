import {setOpenedModal} from 'logic/game/game-actions'
import {getOpenedModal} from 'logic/game/game-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function ExitItem() {
	const dispatch = useDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleExit = () => {
		if (!openedModal) dispatch(setOpenedModal('exit'))
	}

	return (
		<button className={css.item} title="Exit" onClick={handleExit}>
			<img src="/images/toolbar/exit.png" height="30" />
		</button>
	)
}

export default ExitItem
