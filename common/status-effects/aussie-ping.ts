import StatusEffect, {StatusEffectProps, followActiveHermit, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {CoinFlipT, StatusEffectInstance} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {applyStatusEffect, removeStatusEffect} from '../utils/board'
import {slot} from '../slot'

// @TODO Prevent missing on multiple rounds in a row
export class AussiePingStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'aussie-ping',
		name: 'Aussie Ping',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit misses. Lasts until this hermit attacks or the end of the turn.',
		applyCondition: slot.not(slot.hasStatusEffect('aussie-ping-immune')),
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		let {player} = pos

		let coinFlipResult: CoinFlipT | null = null

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.getAttacker()) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, instance.targetInstance)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})

		player.hooks.afterAttack.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
			if (coinFlipResult === 'heads') {
				applyStatusEffect(game, 'aussie-ping-immune', instance.targetInstance)
			}
		})

		player.hooks.onTurnEnd.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
			if (coinFlipResult === 'heads') {
				applyStatusEffect(game, 'aussie-ping-immune', instance.targetInstance)
			}
		})

		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export class AussiePingImmuneStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'aussie-ping-immune',
		name: 'Aussie Ping Immune',
		description: 'This hermit is immune to Aussie Ping until the next turn.',
	}

	public override onApply(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos

		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))
		player.hooks.onTurnStart.add(instance, () => {
			removeStatusEffect(game, getCardPos(game, instance.targetInstance), instance)
			player.hooks.onTurnStart.remove(instance)
		})
	}

	public override onRemoval(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.remove(instance)
	}
}
