import {GameModel} from '../../../models/game-model'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import Fortune from '../../../status-effects/fortune'

class BoomerBdubsRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'boomerbdubs_rare',
		numericId: 228,
		name: 'Boomer Bdubs',
		shortName: 'Boomer B.',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'redstone',
		health: 290,
		primary: {
			name: 'Boom',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'Watch This',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power:
				'Flip a coin as many times as you want.\nDo an additional 20hp damage for every heads, but if tails is flipped, this attack deals 0hp total damage.',
		},
	}

	public override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent
	): void {
		const {player} = component

		let extraDamage = 0

		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			const activeHermit = player.getActiveHermit()

			if (!activeHermit) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Boomer BDubs: Coin Flip',
						modalDescription: 'Do you want to flip a coin for your attack?',
						cards: [],
						selectionSize: 0,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'

					const flip = flipCoin(player, activeHermit)[0]

					if (flip === 'tails') {
						extraDamage = 0
						return 'SUCCESS'
					}

					extraDamage += 20

					player.hooks.getAttackRequests.call(activeInstance, hermitAttackType)

					// After the first coin flip we remove fortune to prevent infinite coin flips.
					game.components.filter(
						StatusEffectComponent<PlayerComponent>,
						query.effect.is(Fortune),
						query.effect.target((_game, targetPlayer: PlayerComponent) => targetPlayer.id === player.id)
					)

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (extraDamage === 0) {
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
				return
			}

			attack.addDamage(component.entity, extraDamage)
		})
	}
}

export default BoomerBdubsRare
