import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
)

const Egg: SingleUse = {
	...singleUse,
	id: 'egg',
	numericId: 140,
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
	log: (values) => `${values.defaultLog} on $o${values.pick.name}$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let afkHermitSlot: SlotComponent | null = null

		observer.subscribe(player.hooks.getAttackRequests, () => {
			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: pickCondition,
				onResult(pickedSlot) {
					afkHermitSlot = pickedSlot
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			})
		})

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!afkHermitSlot?.inRow()) return
			const activeHermit = player.getActiveHermit()
			if (!attack.isAttacker(activeHermit?.entity)) return

			applySingleUse(game, afkHermitSlot)

			// Do not apply single use more than once
			observer.unsubscribe(player.hooks.onAttack)

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'heads') {
				const eggAttack = game
					.newAttack({
						attacker: component.entity,
						target: afkHermitSlot?.row.entity,
						log: (values) =>
							`$p{You|${values.player}}$ flipped $gheads$ on $eEgg$ and did an additional ${values.damage} to ${values.target}`,
						type: 'effect',
					})
					.addDamage(component.entity, 10)

				attack.addNewAttack(eggAttack)
			}

			if (opponentPlayer.canBeKnockedBack()) opponentPlayer.changeActiveRow(afkHermitSlot.row)
		})
	},
}

export default Egg
