import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../status-effects/singleturn-attack-disabled'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const ArchitectFalseRare: Hermit = {
	...hermit,
	id: 'architectfalse_rare',
	numericId: 156,
	name: 'Grand Architect',
	shortName: 'G. Architect',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 3,
	type: ['explorer'],
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
		power:
			'Your opponent can not use the same attack they used on their previous turn.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (
					!attack.isAttacker(component.entity) ||
					attack.type !== 'secondary' ||
					attack.target === null
				)
					return

				const lastAttack = player.opponentPlayer.lastHermitAttackInfo
				if (!lastAttack) return
				lastAttack.forEach((prevAttack) => {
					if (prevAttack.turn !== game.state.turn.turnNumber - 1) return
					if (!prevAttack.attacker.isAlive()) return

					if (prevAttack.attackType === 'primary') {
						game.components
							.new(
								StatusEffectComponent,
								PrimaryAttackDisabledEffect,
								component.entity,
							)
							.apply(prevAttack.attacker.entity)
					} else if (prevAttack.attackType === 'secondary') {
						game.components
							.new(
								StatusEffectComponent,
								SecondaryAttackDisabledEffect,
								component.entity,
							)
							.apply(prevAttack.attacker.entity)
					}
				})
			},
		)
	},
}

export default ArchitectFalseRare
