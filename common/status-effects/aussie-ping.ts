import StatusEffect, {
	StatusEffectProps,
	followActiveHermit,
	hiddenStatusEffect,
	systemStatusEffect,
} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipT, StatusEffectComponent} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {applyStatusEffect, removeStatusEffect} from '../utils/board'
import {slot} from '../components/query'

export class AussiePingStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'aussie-ping',
		name: 'Aussie Ping',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit misses. Lasts until this hermit attacks or the end of the turn.',
		applyCondition: slot.not(slot.hasStatusEffect('aussie-ping-immune')),
	}

	override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		let {player} = pos

		let coinFlipResult: CoinFlipT | null = null

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.getAttacker()) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, instance.target)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})

		player.hooks.afterAttack.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
			if (coinFlipResult === 'heads') {
				applyStatusEffect(game, 'aussie-ping-immune', instance.target)
			}
		})

		player.hooks.onTurnEnd.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
			if (coinFlipResult === 'heads') {
				applyStatusEffect(game, 'aussie-ping-immune', instance.target)
			}
		})

		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export class AussiePingImmuneStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		id: 'aussie-ping-immune',
	}

	public override onApply(
		game: GameModel,
		instance: StatusEffectComponent<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos

		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))
		player.hooks.onTurnStart.add(instance, () => {
			removeStatusEffect(game, getCardPos(game, instance.target), instance)
			player.hooks.onTurnStart.remove(instance)
		})
	}

	public override onRemoval(
		game: GameModel,
		instance: StatusEffectComponent<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.remove(instance)
	}
}
