import {Card} from '../cards/base/types'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {
	CardStatusEffect,
	StatusEffectProps,
	systemStatusEffect,
} from './status-effect'

export class DeathloopReady extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'deathloop-ready',
		name: 'Deathloop Ready',
		description: 'This hermit will be revived on death.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent<Card>, StatusEffectProps>,
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
						effect.statusEffect.props.icon === 'revived_by_deathloop',
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
				`Using $vDeathloop$, $p${targetHermit.card.name}$ revived with $g50hp$`,
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
	}
}

export class RevivedByDeathloopEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'revived-by-deathloop',
		name: 'Revived',
		description: "This hermit has been revived by Scar's deathloop attack.",
	}
}
