import StatusEffect, {
	StatusEffectProps,
	hiddenStatusEffect,
	systemStatusEffect,
} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipT} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {card, query} from '../components/query'
import {CardComponent, StatusEffectComponent} from '../components'
import {STATUS_EFFECTS} from '.'

export class AussiePingStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'aussie-ping',
		name: 'Aussie Ping',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit misses. Lasts until this hermit attacks or the end of the turn.',
		applyCondition: query.not(card.hasStatusEffect('aussie-ping-immune')),
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		let {player} = target

		let coinFlipResult: CoinFlipT | null = null

		player.hooks.beforeAttack.add(effect, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.attacker) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, effect.target)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})

		player.hooks.afterAttack.add(effect, (_) => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components
					.new(StatusEffectComponent, STATUS_EFFECTS['aussie-ping-immune'])
					.apply(target.entity)
			}
		})

		player.hooks.onTurnEnd.add(effect, (_) => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components
					.new(StatusEffectComponent, STATUS_EFFECTS['aussie-ping-immune'])
					.apply(target.entity)
			}
		})

		player.hooks.onActiveRowChange.add(effect, (_, newActiveHermit) => {
			effect.remove()
			effect.apply(newActiveHermit.entity)
		})
	}

	override onRemoval(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player} = target

		player.hooks.beforeAttack.remove(effect)
		player.hooks.afterAttack.remove(effect)
		player.hooks.onActiveRowChange.remove(effect)
		player.hooks.onTurnEnd.remove(effect)
	}
}

export class AussiePingImmuneStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		id: 'aussie-ping-immune',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent
	): void {
		const {player} = target
		player.hooks.onTurnStart.add(effect, () => {
			player.hooks.onTurnStart.remove(effect)
		})
		player.hooks.onActiveRowChange.add(effect, (_, newActiveHermit) => {
			effect.remove()
			effect.apply(newActiveHermit.entity)
		})
	}

	public override onRemoval(
		game: GameModel,
		effect: StatusEffectComponent<StatusEffectProps>,
		target: CardComponent
	): void {
		const {player} = target
		player.hooks.onActiveRowChange.remove(effect)
	}
}
