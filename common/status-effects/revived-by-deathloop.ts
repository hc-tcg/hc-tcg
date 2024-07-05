import {CardPosModel} from '../models/card-pos-model'
import {GameModel} from '../models/game-model'
import {StatusEffectInstance} from '../types/game-state'
import StatusEffect, {StatusEffectProps} from './status-effect'

class RevivedByDeathloopStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		id: 'revived-by-deathloop',
		name: 'Revived',
		description: "This hermit has been revived by Scar's deathloop attack.",
		damageEffect: false,
	}
	public override onApply(
		game: GameModel,
		statusEffectInfo: StatusEffectInstance,
		pos: CardPosModel
	): void {
		game.state.statusEffects.push(statusEffectInfo)
	}
}

export default RevivedByDeathloopStatusEffect
