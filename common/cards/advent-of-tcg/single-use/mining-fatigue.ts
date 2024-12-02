import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {MiningFatigueEffect} from '../../../status-effects/mining-fatigue'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const MiningFatigue: SingleUse = {
	...singleUse,
	id: 'mining_fatigue',
	numericId: 247,
	name: 'Mining Fatigue',
	expansion: 'advent_of_tcg_ii',
	rarity: 'ultra_rare',
	tokens: 3,
	description:
		"Give your opponent's active Hermit Mining Fatigue for their next 3 turns.",
	showConfirmationModal: true,
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'mining-fatigue',
		},
	],
	log: (values) => values.defaultLog,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(
			CardComponent,
			query.card.opponentPlayer,
			query.card.slot(query.slot.hermit),
			query.card.active,
			query.card.isHermit,
		),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const effect = opponentPlayer
				.getActiveHermit()
				?.getStatusEffect(MiningFatigueEffect)
			if (effect) {
				effect.counter = MiningFatigueEffect.counter
				if (MiningFatigueEffect.applyLog)
					game.battleLog.addStatusEffectEntry(
						effect.entity,
						MiningFatigueEffect.applyLog,
					)
				return
			}

			game.components
				.new(StatusEffectComponent, MiningFatigueEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	},
}

export default MiningFatigue
