import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from '../../../status-effects/multiturn-attack-disabled'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class ArchitectFalseRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'architectfalse_rare',
		numericId: 156,
		name: 'Grand Architect',
		shortName: 'G. Architect',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 3,
		type: 'explorer',
		health: 250,
		primary: {
			name: 'Seeing Double',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Amnesia',
			cost: ['explorer', 'explorer', 'explorer'],
			damage: 100,
			power: 'Your opponent can not use the same attack they used on their previous turn.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player, opponentPlayer} = component

		let blockAttack = false

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			blockAttack = true
		})

		observer.subscribe(opponentPlayer.hooks.onAttack, (attack) => {
			if (!blockAttack) return
			if (attack.type === 'primary') {
				game.components
					.new(StatusEffectComponent, MultiturnPrimaryAttackDisabledEffect)
					.apply(opponentPlayer.getActiveHermit()?.entity)
			} else if (attack.type === 'secondary') {
				game.components
					.new(StatusEffectComponent, MultiturnSecondaryAttackDisabledEffect)
					.apply(opponentPlayer.getActiveHermit()?.entity)
			}
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			blockAttack = false
		})
	}
}

export default ArchitectFalseRare
