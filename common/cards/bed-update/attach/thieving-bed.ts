import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {afterAttack, onTurnEnd} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const ThievingBed: Attach = {
	...attach,
	id: 'thieving_bed',
	numericId: 268,
	expansion: 'beds',
	name: 'Thieving Bed',
	rarity: 'ultra_rare',
	tokens: 3,
	description:
		'At the end of your turn, heal 10hp for each 20hp damage you do that turn.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let damage = 0

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				damage += attack.calculateDamage()
			},
		)
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				const heal = 10 * Math.floor(damage / 20)
				damage = 0
				if (!component.slot.inRow()) return
				component.slot.row.heal(heal)
			},
		)
	},
}

export default ThievingBed
