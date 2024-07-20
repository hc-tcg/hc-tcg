import {CardProps} from '../cards/base/types'
import {StatusEffectComponent, CardComponent, ObserverComponent} from '../components'
import {GameModel} from '../models/game-model'
import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'

export class DeathloopReady extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'deathloop-ready',
		name: 'Deathloop Ready',
		description: 'This hermit will be revived on death.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent<CardProps>, StatusEffectProps>,
		target: CardComponent<CardProps>,
		observer: ObserverComponent
	) {
		const {player, opponentPlayer} = target

	
		// Add before so health can be checked reliably
		observer.subscribeBefore(opponentPlayer.hooks.afterAttack, (attack) => {
			const row = attack.target
			if (!row || row.health === null || row.health > 0) return
			const target = row.getHermit()
			if (!target) return

			row.health = 50

			game.components
				.filter(
					StatusEffectComponent,
					(_game, effect) =>
						effect.target?.entity === target.entity &&
						effect.statusEffect.props.icon === 'revived_by_deathloop'
				)
				.forEach((effect) => effect.remove())

			game.battleLog.addEntry(
				player.entity,
				`Using $vDeathloop$, $p${target.props.name}$ revived with $g50hp$`
			)

			game.components.new(StatusEffectComponent, RevivedByDeathloopEffect).apply(target.entity)
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
