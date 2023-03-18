import {useDispatch, useSelector} from 'react-redux'
import {setOpenedModal} from 'logic/game/game-actions'
import {getOpenedModal} from 'logic/game/game-selectors'
import classnames from 'classnames'
import css from './toolbar.module.scss'

function ForfeitItem() {
	const dispatch = useDispatch()
	const openedModal = useSelector(getOpenedModal)

	const handleSoundChange = () => {
		if (!openedModal) dispatch(setOpenedModal('forfeit'))
	}

	return (
		<div
			className={classnames(css.item, css.clickable)}
			title="Forfeit"
			onClick={handleSoundChange}
		>
			<img src="/images/toolbar/banner.png" height="30" />
		</div>
	)
}

export default ForfeitItem
