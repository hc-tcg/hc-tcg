import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const JinglerRare: Hermit = {
	...hermit,
	id: 'jingler_rare',
	numericId: 133,
	name: 'Jingler',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: 'speedrunner',
	health: 280,
	primary: {
		name: 'Jingled',
		cost: ['speedrunner'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Deception',
		cost: ['speedrunner', 'speedrunner', 'any'],
		damage: 80,
		power:
			'Flip a coin.\nIf heads, your opponent must choose one card to discard from their hand.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (opponentPlayer.getHand().length === 0) return

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] === 'tails') return

				game.addPickRequest({
					player: opponentPlayer.entity,
					id: component.entity,
					message: 'Pick 1 card from your hand to discard',
					canPick: query.every(query.slot.opponent, query.slot.hand),
					onResult(pickedSlot) {
						pickedSlot.getCard()?.discard()
					},
					onTimeout() {
						game.components
							.find(
								CardComponent,
								query.card.slot(query.slot.hand),
								query.card.opponentPlayer,
							)
							?.discard()
					},
				})
			},
		)
	},
}

export default JinglerRare
