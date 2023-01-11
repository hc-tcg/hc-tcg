import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import CARDS from 'server/cards'
import {CardT} from 'types/cards'
import Card from 'components/card'
import css from './game.module.css'

const TYPED_CARDS = CARDS as Record<string, CardT>

type Props = {
	name: string
	gameType: 'stranger' | 'friend'
}
function Game(props: Props) {
	const gameState = useSelector((state: RootState) => state.gameState)
	const playerId = useSelector((state: RootState) => state.playerId)

	if (!gameState) return <main>Loading</main>

	const playerState = gameState.players[playerId]

	const playerHand = playerState.hand.map((cardId) => {
		if (!TYPED_CARDS.hasOwnProperty(cardId)) {
			throw new Error('Unsupported card id: ' + cardId)
		}
		return TYPED_CARDS[cardId]
	})

	const playerHandJsx = playerHand.map((card) => {
		// TODO - support duplicates (each individual card should have unique id)
		return <Card key={card.id} card={card} />
	})

	return (
		<main>
			<div>Board</div>
			<div className={css.hand}>{playerHandJsx}</div>
		</main>
	)
}

export default Game
