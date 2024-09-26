import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack, beforeAttack} from '../../../types/priorities'
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
		let pickedAfkSlot: SlotComponent | null = null

		// Pick the hermit to heal
		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				const pickCondition = query.every(
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.not(query.slot.has(PharaohRare)),
				)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick an AFK Hermit from either side of the board',
					canPick: pickCondition,
					onResult(pickedSlot) {
						// Store the info to use later
						pickedAfkSlot = pickedSlot
					},
					onTimeout() {
						// We didn't pick anyone to heal, so heal no one
					},
				})
			},
		)

		// Heals the afk hermit *before* we actually do damage
		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!pickedAfkSlot?.inRow()) return

				const coinFlip = flipCoin(player, component)
				if (coinFlip[0] === 'tails') return

				const healAmount = attack.calculateDamage()
				pickedAfkSlot.row.heal(healAmount)
				const healedHermit = pickedAfkSlot.getCard()
				game.battleLog.addEntry(
					player.entity,
					`$${healedHermit?.player === component.player ? 'p' : 'o'}${healedHermit?.props.name} (${
						pickedAfkSlot.row.index + 1
					})$ was healed $g${healAmount}hp$ by $p${component.props.name}$`,
				)
			},
		)

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				pickedAfkSlot = null
			},
		)
	},
}

export default PharaohRare
