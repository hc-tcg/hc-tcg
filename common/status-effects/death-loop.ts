import {Card} from '../cards/base/types'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const DeathloopReady: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'deathloop-ready',
	icon: 'deathloop-ready',
	name: 'Deathloop Ready',
	description: 'This hermit will be revived on death.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent<Card>, StatusEffect>,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = target

		// Add before so health can be checked reliably
		observer.subscribeBefore(opponentPlayer.hooks.afterAttack, (attack) => {
			const row = attack.target
			if (!row || row.health === null || row.health > 0) return
			const targetHermit = row.getHermit()
			if (!targetHermit) return

			if (targetHermit.entity !== target.entity) return

			row.health = 50

			game.components
				.filter(
					StatusEffectComponent,
					(_game, effect) =>
						effect.target?.entity === targetHermit.entity &&
						effect.props.icon === 'revived_by_deathloop',
				)
				.forEach((effect) => effect.remove())

			game.components
				.filter(
					StatusEffectComponent,
					query.effect.targetEntity(target.entity),
					query.effect.type('normal', 'damage'),
				)
				.forEach((effect) => effect.remove())

			game.battleLog.addEntry(
				player.entity,
				`Using $vDeathloop$, $p${targetHermit.props.name}$ revived with $g50hp$`,
			)

			game.components
				.new(
					StatusEffectComponent,
					RevivedByDeathloopEffect,
					effect.creator.entity,
				)
				.apply(targetHermit.entity)
			effect.remove()
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}

export const RevivedByDeathloopEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'revived-by-deathloop',
	icon: 'revived-by-deathloop',
	name: 'Revived',
	description: "This hermit has been revived by Scar's deathloop attack.",
}
