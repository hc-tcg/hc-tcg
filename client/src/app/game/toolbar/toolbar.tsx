import css from './toolbar.module.scss'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import {getGameState} from 'logic/game/game-selectors'
import {setOpenedModal} from 'logic/game/game-actions'
import ChatItem from './chat-item'
import SoundItem from './sound-item'
import ForfeitItem from './forfeit-item'

function Toolbar() {
	const gameState = useSelector(getGameState)

	const dispatch = useDispatch()
	if (!gameState) return null

	const handleDiscarded = () => {
		dispatch(setOpenedModal('discarded'))
	}

	return (
		<div className={css.toolbar}>
			<div className={css.item} title="Draw deck">
				{gameState.pileCount}
			</div>
			<div
				className={classnames(css.item, css.clickable)}
				title="Discarded"
				onClick={handleDiscarded}
			>
				<img src="/images/toolbar/white_shulker.png" width="35" height="35" />
			</div>
			<ChatItem />
			<SoundItem />
			<div className={css.dynamicSpace} />
			<ForfeitItem />
		</div>
	)
}

export default Toolbar
