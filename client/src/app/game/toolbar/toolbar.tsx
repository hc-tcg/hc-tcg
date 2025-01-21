import {sortCardInstances} from 'common/utils/cards'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getGameState, getIsSpectator} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getPlayerDeckCode} from 'logic/session/session-selectors'
import {useSelector} from 'react-redux'
import ChatItem from './chat-item'
import ExitItem from './exit-item'
import ForfeitItem from './forfeit-item'
import SoundItem from './sound-item'
import css from './toolbar.module.scss'
import TooltipsItem from './tooltips-item'

function Toolbar() {
	const gameState = useSelector(getGameState)
	const settings = useSelector(getSettings)
	const isSpectator = useSelector(getIsSpectator)

	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const activeDeckCode = useSelector(getPlayerDeckCode)
	const activeDeck = databaseInfo.decks.find(
		(deck) => deck.code === activeDeckCode,
	)

	const dispatch = useMessageDispatch()

	const handleViewDeck = () => {
		if (!gameState || !activeDeck) return
		gameState.currentModalData = {
			type: 'selectCards',
			name: 'Deck',
			description: '',
			cards: activeDeck ? sortCardInstances(activeDeck.cards) : [],
			selectionSize: 0,
			primaryButton: {
				text: 'Close',
				variant: 'default',
			},
			cancelable: true,
		}
		dispatch({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: gameState.currentModalData.type,
		})
	}

	const handleDiscarded = () => {
		if (!gameState) return
		gameState.currentModalData = {
			type: 'selectCards',
			name: 'Discarded',
			description:
				gameState.discarded.length === 0
					? 'There are no cards in your discard pile.'
					: '',
			cards: gameState.discarded,
			selectionSize: 0,
			primaryButton: {
				text: 'Close',
				variant: 'default',
			},
			cancelable: true,
		}
		dispatch({
			type: localMessages.GAME_MODAL_OPENED_SET,
			id: gameState.currentModalData.type,
		})
	}

	if (!gameState) return null

	return (
		<div className={css.toolbar}>
			{/* Cards in Deck */}
			{!isSpectator && (
				<button className={css.item} title="Deck" onClick={handleViewDeck}>
					<img src="/images/toolbar/shulker.png" width="35" height="35" />
				</button>
			)}
			{!isSpectator && (
				<div className={css.item} title="Cards Remaining in Deck">
					<p>{gameState.pileCount}</p>
				</div>
			)}

			{/* Discard */}
			{!isSpectator && (
				<button
					className={css.item}
					title="Discarded"
					onClick={handleDiscarded}
				>
					<img src="/images/toolbar/red_shulker.png" width="35" height="35" />
					<span>{useSelector(getGameState)?.discarded.length}</span>
				</button>
			)}

			{/* Toggle Chat */}
			{settings.chatEnabled && <ChatItem />}

			{/* Toggle Tooltips */}
			<TooltipsItem />

			{/* Toggle Sounds */}
			<SoundItem />

			{/* Forfeit Game */}
			{!isSpectator && <ForfeitItem />}

			{/* Forfeit Game */}
			{isSpectator && <ExitItem />}
		</div>
	)
}

export default Toolbar
