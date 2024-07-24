import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../../status-effects/singleturn-attack-disabled'
import {HermitAttackType} from '../../../types/attack'
import Card, {InstancedValue} from '../../base/card'
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

	lastAttacker = new InstancedValue<CardComponent | null>(() => null)
	lastAttackType = new InstancedValue<HermitAttackType | null>(() => null)

	override onCreate(game: GameModel, component: CardComponent) {
		const {opponentPlayer} = component

		const newObserver = game.components.new(ObserverComponent, component.entity)

		newObserver.subscribe(opponentPlayer.hooks.onAttack, (attack) => {
			if (!(attack.attacker instanceof CardComponent)) return
			if (!attack.isType('primary', 'secondary')) return
			this.lastAttacker.set(component, attack.attacker)
			this.lastAttackType.set(component, attack.type)
		})
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (this.lastAttackType.get(component) === 'primary') {
				game.components
					.new(StatusEffectComponent, PrimaryAttackDisabledEffect)
					.apply(this.lastAttacker.get(component)?.entity)
			} else if (this.lastAttackType.get(component) === 'secondary') {
				game.components
					.new(StatusEffectComponent, SecondaryAttackDisabledEffect)
					.apply(this.lastAttacker.get(component)?.entity)
			}
		})
	}
}

export default ArchitectFalseRare
