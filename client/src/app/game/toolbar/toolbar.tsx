import css from './toolbar.module.scss'
import {useSelector, useDispatch} from 'react-redux'
import {getAvailableActions, getGameState} from 'logic/game/game-selectors'
import {setOpenedModal, endTurn} from 'logic/game/game-actions'
import ChatItem from './chat-item'
import SoundItem from './sound-item'
import ForfeitItem from './forfeit-item'
import Button from 'components/button'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

function Toolbar() {
	const gameState = useSelector(getGameState)
	const availableActions = useSelector(getAvailableActions)
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()

	const handleDiscarded = () => {
		dispatch(setOpenedModal('discarded'))
	}

	function handleEndTurn() {
		if (
			availableActions.length === 1 ||
			settings.confirmationDialogs === 'off'
		) {
			dispatch(endTurn())
		} else {
			dispatch(setOpenedModal('end-turn'))
		}
	}

	if (!gameState) return null

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

			{/* End Turn */}
			<Button
				variant={!availableActions.includes('END_TURN') ? 'default' : 'error'}
				size="small"
				style={{height: '4vh', padding: '0 2vh', borderRadius: '1vh'}}
				onClick={handleEndTurn}
				disabled={!availableActions.includes('END_TURN')}
			>
				End Turn
			</Button>
		</div>
	)
}

export default Toolbar
