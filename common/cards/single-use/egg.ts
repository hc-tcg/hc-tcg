import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {executeExtraAttacks} from '../../utils/attacks'
import {applySingleUse} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
	query.slot.canBecomeActive,
)

const Egg: SingleUse = {
	...singleUse,
	id: 'egg',
	numericId: 115,
	name: 'Egg',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	description:
		"After your attack, choose one of your opponent's AFK Hermits to set as their active Hermit, and then flip a coin.\nIf heads, also do 10hp damage to that Hermit.",
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) => `${values.defaultLog} with {your|their} attack`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				const activeHermit = player.getActiveHermit()
				if (!attack.isAttacker(activeHermit?.entity)) return

				applySingleUse(game)

				// Do not apply single use more than once
				observer.unsubscribe(game.hooks.afterAttack)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: "Pick one of your opponent's AFK Hermits",
					canPick: pickCondition,
					onResult(pickedSlot) {
						let afkHermitSlot = pickedSlot
						if (!afkHermitSlot?.inRow()) return

						opponentPlayer.knockback(afkHermitSlot.row)

						const coinFlip = flipCoin(game, player, component)
						if (coinFlip[0] === 'heads') {
							const eggAttack = game
								.newAttack({
									attacker: component.entity,
									player: player.entity,
									target: afkHermitSlot?.row.entity,
									log: (values) =>
										`$p{You|${values.player}}$ flipped $gheads$ on $eEgg$ and did an additional ${values.damage} to ${values.target}`,
									type: 'effect',
								})
								.addDamage(component.entity, 10)

							executeExtraAttacks(game, [eggAttack])
						} else {
							game.battleLog.addEntry(
								player.entity,
								`$p{You|${player.playerName}}$ flipped $btails$ on $eEgg$`,
							)
						}
					},
					onTimeout() {
						// We didn't pick a target so do nothing
					},
				})
			},
		)
	},
}

export default Egg
