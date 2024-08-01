import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import query from '../../../components/query'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import NaughtyRegiftEffect from '../../../status-effects/naughty-regift'

class GrianchRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'grianch_rare',
		numericId: 209,
		name: 'The Grianch',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 3,
		type: 'builder',
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
				'Flip a Coin.\nIf heads, attack damage doubles.\nIf tails, your opponent may attack twice next round.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return

			if (attack.type === 'primary') {
				// Heals the afk hermit *before* we actually do damage
				if (!pickedAfkSlot?.inRow()) return
				pickedAfkSlot.row.heal(40)
				let hermit = pickedAfkSlot.row.getHermit()

				game.battleLog.addEntry(
					player.entity,
					`$p${hermit?.props.name} (${pickedAfkSlot.row.index + 1})$ was healed $g40hp$ by $p${
						component.card.props.name
					}$`
				)
			} else if (attack.type === 'secondary') {
				const coinFlip = flipCoin(player, component)

				if (coinFlip[0] === 'tails') {
					game.components
						.new(StatusEffectComponent, NaughtyRegiftEffect, component.entity)
						.apply(opponentPlayer.entity)
					return
				}

				attack.multiplyDamage(component.entity, 2)
			}
		})

		let pickedAfkSlot: SlotComponent | null = null

		// Pick the hermit to heal
		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only primary attack
			if (hermitAttackType !== 'primary') return

			const pickCondition = query.every(
				query.not(query.slot.active),
				query.not(query.slot.empty),
				query.slot.hermit
			)

			// Make sure there is something to select
			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
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
		})
	}
}

export default GrianchRare
