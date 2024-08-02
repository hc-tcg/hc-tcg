import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from "../components"
import {GameModel} from "../models/game-model"
import {
	PlayerStatusEffect,
	StatusEffectProps,
	systemStatusEffect,
} from "./status-effect"

export default class FortuneEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		name: "Fortune",
		icon: "fortune",
		description: "Any coin flips this turn will roll heads.",
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onCoinFlip, (_card, coinFlips) => {
			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i] = "heads"
			}
			return coinFlips
		})

		observer.subscribe(player.opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}
