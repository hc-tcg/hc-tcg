import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const MonkeyfarmRare: Hermit = {
	...hermit,
	id: 'monkeyfarm_rare',
	numericId: 212,
	name: 'Monkeyfarm',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	type: 'farm',
	health: 250,
	primary: {
		name: 'Skull',
		cost: ['farm'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Monkeystep',
		cost: ['farm', 'farm'],
		damage: 80,
		power:
			"Flip a coin. If heads, discard 1 attached item card from an opponent's AFK Hermit.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const pickCondition = query.every(
					query.slot.opponent,
					query.slot.item,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.not(query.slot.frozen),
				)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] !== 'heads') return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: "Pick one of your opponent's AFK Hermit's item cards",
					canPick: pickCondition,
					onResult(pickedSlot) {
						pickedSlot.card?.discard()
					},
				})
			},
		)
	},
}

export default MonkeyfarmRare
