import css from './toolbar.module.scss'
import {useSelector, useDispatch} from 'react-redux'
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
			{/* Cards in Deck */}
			<div className={css.item} title="Cards Remaining in Deck">
				<p>{gameState.pileCount}</p>
			</div>

			{/* Discard */}
			<button className={css.item} title="Discarded" onClick={handleDiscarded}>
				<img src="/images/toolbar/red_shulker.png" width="35" height="35" />
				<span>{useSelector(getGameState)?.discarded.length}</span>
			</button>

			{/* Toggle Chat */}
			<ChatItem />

			{/* Toggle Sounds */}
			<SoundItem />

			{/* Forfeit Game */}
			<ForfeitItem />
		</div>
	)
}

export default Toolbar
