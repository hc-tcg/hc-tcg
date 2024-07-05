import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {CoinFlipT, StatusEffectInstance} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {applyStatusEffect, removeStatusEffect} from '../utils/board'

// @TODO Prevent missing on multiple rounds in a row
class AussiePingStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'aussie-ping',
		name: 'Aussie Ping',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit misses. Lasts until this hermit attacks or the end of the turn.',
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
		})

		player.hooks.onTurnEnd.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
		})

		player.hooks.onActiveRowChange.add(instance, (oldRow, newRow) => {
			if (oldRow === null || newRow === null) return

			let oldHermit = player.board.rows[oldRow].hermitCard
			let newHermit = player.board.rows[newRow].hermitCard

			if (!oldHermit || !newHermit) return

			removeStatusEffect(game, getCardPos(game, oldHermit), instance)
			applyStatusEffect(game, 'aussie-ping', newHermit)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default AussiePingStatusEffect
