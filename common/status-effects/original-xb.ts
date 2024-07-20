import {PlayerStatusEffect, StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'

class OriginalXbEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'original_xb',
		name: 'Original XB',
		description:
			"Draw an additional card at the end",
	}

	override onApply(_game: GameModel, effect: StatusEffectComponent<PlayerComponent>, player: PlayerComponent, observer: ObserverComponent): void {
		observer.oneShot(player.opponentPlayer.hooks.onTurnEnd, () => {
            player.opponentPlayer.draw(1)
            effect.remove()
        })
	}
}

export default OriginalXbEffect
