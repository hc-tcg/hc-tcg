import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const IJevinRare: Hermit = {
	...hermit,
	id: 'ijevin_rare',
	numericId: 39,
	name: 'Jevin',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	type: 'speedrunner',
	health: 300,
	primary: {
		name: 'Your Boi',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Peace Out',
		cost: ['speedrunner', 'speedrunner', 'any'],
		damage: 90,
		power:
			'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				let knockbackPickRequest =
					opponentPlayer.getKnockbackPickRequest(component)
				if (knockbackPickRequest) game.addPickRequest(knockbackPickRequest)
			},
		)
	},
}

export default IJevinRare
