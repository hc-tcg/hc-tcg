import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const PharaohRare: Hermit = {
	...hermit,
	id: 'pharaoh_rare',
	numericId: 214,
	name: 'Pharaoh',
	expansion: 'advent_of_tcg',
	palette: 'pharoah',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: 'balanced',
	health: 300,
	primary: {
		name: 'Targét',
		cost: ['balanced'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Xibalba',
		cost: ['balanced', 'balanced'],
		damage: 80,
		power:
			'Flip a coin. If heads, can give up to 80hp to AFK Hermit. Health given is equal to damage during attack. Can not heal other Pharaohs.',
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

				const healAmount = Math.min(
					attack.nextAttacks.reduce(
						(r, subAttack) =>
							subAttack.isAttacker(component.entity) &&
							subAttack.isType('secondary', 'weakness')
								? r + subAttack.calculateDamage()
								: r,
						attack.calculateDamage(),
					),
					80,
				)
				if (healAmount === 0) return

				const pickCondition = query.every(
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.not(query.slot.has(PharaohRare)),
				)
				if (!game.components.exists(SlotComponent, pickCondition)) return

				const coinFlip = flipCoin(player, component)
				if (coinFlip[0] === 'tails') return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick an AFK Hermit from either side of the board',
					canPick: pickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						pickedSlot.row.heal(healAmount)
						const healedHermit = pickedSlot.getCard()
						game.battleLog.addEntry(
							player.entity,
							`$${healedHermit?.player === component.player ? 'p' : 'o'}${healedHermit?.props.name} (${
								pickedSlot.row.index + 1
							})$ was healed $g${healAmount}hp$ by $p${component.props.name}$`,
						)
					},
					onTimeout() {
						// We didn't pick anyone to heal, so heal no one
					},
				})
			},
		)
	},
}

export default PharaohRare
