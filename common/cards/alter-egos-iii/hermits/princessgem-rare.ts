import {GameModel} from '../../../models/game-model'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import Card, {InstancedValue} from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import RoyalProtectionEffect from '../../../status-effects/royal-protection'
import query from '../../../components/query'

class PrincessGemRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'princessgem_rare',
		numericId: 168,
		name: 'Princess Gem',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'speedrunner',
		health: 270,
		primary: {
			name: 'Sunny Days',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Empire',
			cost: ['speedrunner', 'speedrunner', 'any'],
			damage: 90,
			power:
				"After your attack, choose an AFK Hermit. Until the end of your opponent's next turn, any damage done to that Hermit is prevented.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const pickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.hermit,
				query.not(query.slot.empty),
				query.not(query.slot.active),
				query.not(query.slot.hasStatusEffect(RoyalProtectionEffect))
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick one of your AFK Hermits',
				canPick: pickCondition,
				onResult: (pickedSlot) => {
					game.components
						.new(StatusEffectComponent, RoyalProtectionEffect)
						.apply(pickedSlot.getCard()?.entity)
				},
			})
		})
	}
}

export default PrincessGemRare
