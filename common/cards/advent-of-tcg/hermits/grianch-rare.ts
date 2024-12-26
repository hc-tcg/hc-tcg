import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import FortuneEffect from '../../../status-effects/fortune'
import NaughtyRegiftEffect from '../../../status-effects/naughty-regift'
import SpentFortuneEffect from '../../../status-effects/spent-fortune'
import {beforeAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const GrianchRare: Hermit = {
	...hermit,
	id: 'grianch_rare',
	numericId: 463,
	name: 'The Grianch',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 4,
	type: ['builder'],
	health: 250,
	primary: {
		name: 'Nice',
		cost: ['builder', 'any'],
		damage: 70,
		power: 'Heal any AFK Hermit for 40hp.',
	},
	secondary: {
		name: 'Naughty',
		cost: ['builder', 'builder'],
		damage: 80,
		power:
			'Flip a Coin.\nIf heads, you may attack an additional time.\nIf tails, your opponent may attack twice next round.\nWhen this attack is used with Fortune, only the first coin flip will be affected',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return

				if (attack.type === 'primary') {
					// Heals the afk hermit *before* we actually do damage
					if (!pickedAfkSlot?.inRow()) return
					pickedAfkSlot.row.heal(40)
					let hermit = pickedAfkSlot.row.getHermit()

					game.battleLog.addEntry(
						player.entity,
						`$p${hermit?.props.name} (${pickedAfkSlot.row.index + 1})$ was healed $g40hp$ by $p${
							component.props.name
						}$`,
					)
				} else if (attack.type === 'secondary') {
					const spentFortune = player.hasStatusEffect(SpentFortuneEffect)
					spentFortune?.remove()
					const coinFlip = flipCoin(game, player, component)
					spentFortune?.apply(player.entity)

					if (coinFlip[0] === 'tails') {
						game.components
							.new(StatusEffectComponent, NaughtyRegiftEffect, component.entity)
							.apply(opponentPlayer.entity)
						return
					}

					const fortune = game.components.find(
						StatusEffectComponent,
						query.effect.is(FortuneEffect),
						query.effect.targetEntity(player.entity),
					)
					if (fortune) {
						fortune.remove()
						game.components
							.new(
								StatusEffectComponent,
								SpentFortuneEffect,
								fortune.creatorEntity,
							)
							.apply(player.entity)
					}

					game.removeCompletedActions(
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'SINGLE_USE_ATTACK',
					)
					game.removeBlockedActions(
						'game',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'SINGLE_USE_ATTACK',
					)
				}
			},
		)

		let pickedAfkSlot: SlotComponent | null = null

		// Pick the hermit to heal
		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only primary attack
				if (hermitAttackType !== 'primary') return

				const pickCondition = query.every(
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.slot.hermit,
				)

				// Make sure there is something to select
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
	},
}

export default GrianchRare
