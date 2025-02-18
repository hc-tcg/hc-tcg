import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {ReadonlyAttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {afterAttack, beforeAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

function getAllSubattacks(
	attack: ReadonlyAttackModel,
): Array<ReadonlyAttackModel> {
	return [attack, ...attack.nextAttacks.flatMap(getAllSubattacks)]
}

const PharaohRare: Hermit = {
	...hermit,
	id: 'pharaoh_rare',
	numericId: 214,
	name: 'Pharaoh',
	expansion: 'advent_of_tcg',
	palette: 'pharaoh',
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

		let singleUseAttack: ReadonlyAttackModel | null = null
		let activeSingleUse: CardComponent | null = null

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const su = game.components.find(
					CardComponent,
					query.card.slot(query.slot.singleUse),
				)
				if (!su?.isSingleUse() || !su.props.hasAttack) return
				activeSingleUse = su
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (!activeSingleUse || singleUseAttack) return
				if (!attack.isAttacker(activeSingleUse.entity)) return

				singleUseAttack = attack
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				let healAmount = getAllSubattacks(attack).reduce(
					(r, subAttack) =>
						subAttack.isAttacker(component.entity) &&
						subAttack.isType('secondary', 'weakness')
							? r + subAttack.calculateDamage()
							: r,
					0,
				)
				if (singleUseAttack)
					healAmount = getAllSubattacks(singleUseAttack).reduce(
						(r, subAttack) =>
							subAttack.isAttacker(activeSingleUse?.entity)
								? r + subAttack.calculateDamage()
								: r,
						healAmount,
					)

				singleUseAttack = null
				activeSingleUse = null

				healAmount = Math.min(healAmount, 80)
				if (healAmount === 0) return

				const pickCondition = query.every(
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.not(query.slot.has(PharaohRare)),
				)
				if (!game.components.exists(SlotComponent, pickCondition)) return

				const coinFlip = flipCoin(game, player, component)
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
