import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../../status-effects/singleturn-attack-disabled'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const ArchitectFalseRare: Hermit = {
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
				if (!lastAttack || lastAttack.turn !== game.state.turn.turnNumber - 1)
					return
				if (!lastAttack.attacker.isAlive()) return

				if (lastAttack.attackType === 'primary') {
					game.components
						.new(
							StatusEffectComponent,
							PrimaryAttackDisabledEffect,
							component.entity,
						)
						.apply(lastAttack.attacker.entity)
				} else if (lastAttack.attackType === 'secondary') {
					game.components
						.new(
							StatusEffectComponent,
							SecondaryAttackDisabledEffect,
							component.entity,
						)
						.apply(lastAttack.attacker.entity)
				}
			},
		)
	},
}

export default ArchitectFalseRare
