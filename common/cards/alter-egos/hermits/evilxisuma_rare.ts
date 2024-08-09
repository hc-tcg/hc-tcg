import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../../status-effects/singleturn-attack-disabled'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const opponentActiveHermitQuery = query.every(
	query.card.opponentPlayer,
	query.card.active,
	query.card.isHermit,
)

const EvilXisumaRare: Hermit = {
	...hermit,
	id: 'evilxisuma_rare',
	numericId: 128,
	name: 'Evil X',
	rarity: 'rare',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	tokens: 3,
	type: 'balanced',
	health: 280,
	primary: {
		name: 'Evil Inside',
		cost: [],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Derpcoin',
		cost: ['balanced', 'balanced'],
		damage: 80,
		power:
			"Flip a coin.\nIf heads, choose one attack of your opponent's current active Hermit to disable on their next turn.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			if (!game.components.exists(CardComponent, opponentActiveHermitQuery)) {
				blockedActions.push('SECONDARY_ATTACK')
			}
			return blockedActions
		})

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] !== 'heads') return

			let opponentActiveHermit = game.components.find(
				CardComponent,
				opponentActiveHermitQuery,
			)
			if (!opponentActiveHermit) return

			game.addModalRequest({
				player: player.entity,
				data: {
					modalId: 'copyAttack',
					payload: {
						modalName: 'Evil X: Disable an attack for 1 turn',
						modalDescription:
							"Which of the opponent's attacks do you want to disable?",
						hermitCard: opponentActiveHermit.entity,
					},
				},
				onResult(modalResult) {
					if (!modalResult || !modalResult.pick) return 'FAILURE_INVALID_DATA'

					const actionToBlock =
						modalResult.pick === 'primary'
							? PrimaryAttackDisabledEffect
							: SecondaryAttackDisabledEffect

					// This will add a blocked action for the duration of their turn
					game.components
						.new(StatusEffectComponent, actionToBlock, component.entity)
						.apply(opponentPlayer.getActiveHermit()?.entity)
					return 'SUCCESS'
				},
				onTimeout() {
					// Disable the secondary attack if we didn't choose one
					game.components
						.new(
							StatusEffectComponent,
							SecondaryAttackDisabledEffect,
							component.entity,
						)
						.apply(opponentPlayer.getActiveHermit()?.entity)
				},
			})
		})
	},
}

export default EvilXisumaRare
