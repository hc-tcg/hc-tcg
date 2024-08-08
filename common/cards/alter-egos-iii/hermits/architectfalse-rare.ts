import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import {PlayerEntity} from '../../../entities'
import {GameModel, GameValue} from '../../../models/game-model'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../../status-effects/singleturn-attack-disabled'
import {HermitAttackType} from '../../../types/attack'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

type AttackInfo = {
	attacker: CardComponent
	attackType: HermitAttackType
	turn: number
}

const lastAttackInfo = new GameValue<
	Record<PlayerEntity, AttackInfo | undefined>
>(() => {
	return {}
})

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
	onCreate(game: GameModel, component: CardComponent) {
		if (game.id in lastAttackInfo.values) return
		lastAttackInfo.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) =>
			newObserver.subscribe(player.hooks.onAttack, (attack) => {
				if (!(attack.attacker instanceof CardComponent)) return
				if (!attack.isType('primary', 'secondary')) return
				lastAttackInfo.get(game)[player.entity] = {
					attacker: attack.attacker,
					attackType: attack.type,
					turn: game.state.turn.turnNumber,
				}
			}),
		)
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (
				!attack.isAttacker(component.entity) ||
				attack.type !== 'secondary' ||
				attack.target === null
			)
				return

			const lastAttack = lastAttackInfo.get(game)[attack.target.playerId]
			if (!lastAttack || lastAttack.turn !== game.state.turn.turnNumber - 1)
				return

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
		})
	},
}

export default ArchitectFalseRare
