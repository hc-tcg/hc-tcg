import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {SingleTurnMiningFatigueEffect} from '../../../status-effects/mining-fatigue'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const ElderGuardian: Attach = {
	...attach,
	id: 'elder_guardian',
	name: 'Elder Guardian',
	expansion: 'minecraft',
	numericId: 1395,
	rarity: 'rare',
	tokens: 2,
	description:
		"When this hermit is attacked, the opponent's active hermit recieves mining fatigue for one round.",
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'single-turn-mining-fatigue',
		},
	],
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isTargeting(component) || attack.isType('status-effect'))
					return
				if (attack.player !== opponentPlayer) return

				const opponentActiveHermit = opponentPlayer.getActiveHermit()
				if (!opponentActiveHermit) return

				const previousStatus = opponentActiveHermit.getStatusEffect(
					SingleTurnMiningFatigueEffect,
				)
				if (
					previousStatus &&
					previousStatus.counter !== null &&
					previousStatus.counter < 2
				)
					previousStatus.remove()

				game.components
					.new(
						StatusEffectComponent,
						SingleTurnMiningFatigueEffect,
						component.entity,
					)
					.apply(opponentActiveHermit.entity)
			},
		)
	},
}

export default ElderGuardian
