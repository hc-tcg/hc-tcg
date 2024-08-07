import {localMessages, useActionDispatch} from 'logic/messages'
import {getGameState} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import ChatItem from './chat-item'
import ForfeitItem from './forfeit-item'
import SoundItem from './sound-item'
import css from './toolbar.module.scss'
import TooltipsItem from './tooltips-item'

function Toolbar() {
	const gameState = useSelector(getGameState)
	const settings = useSelector(getSettings)
	const dispatch = useActionDispatch()

	const handleDiscarded = () => {
		if (!gameState) return
		gameState.currentModalData = {
			modalId: 'selectCards',
			payload: {
				modalName: 'Discarded',
				modalDescription:
					gameState.discarded.length === 0
						? 'There are no cards in your discard pile.'
						: '',
				cards: gameState.discarded,
				selectionSize: 0,
				primaryButton: {
					text: 'Close',
					variant: 'default',
				},
			},
		}
		dispatch({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: gameState.currentModalData.modalId,
		})
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
			{settings.disableChat === 'off' && <ChatItem />}

			{/* Toggle Tooltips */}
			<TooltipsItem />

			{/* Toggle Sounds */}
			<SoundItem />

			{/* Forfeit Game */}
			<ForfeitItem />
		</div>
	)
}

export default Toolbar
