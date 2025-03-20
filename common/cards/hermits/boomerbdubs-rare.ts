import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import FortuneEffect from '../../status-effects/fortune'
import SpentFortuneEffect from '../../status-effects/spent-fortune'
import {SelectCards} from '../../types/modal-requests'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const BoomerBdubsRare: Hermit = {
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
			'Flip a coin as many times as you want.\nDo an additional 20hp damage for every heads, but if tails is flipped, this attack deals 0hp total damage.\nWhen this attack is used with Fortune, only the first coinflip will be affected.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		let extraDamage = 0
		let flippedTails = false

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				extraDamage = 0
				flippedTails = false
			},
		)

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				const activeHermit = player.getActiveHermit()

				if (!activeHermit) return

				let fortune: StatusEffectComponent | null

				const followUpModal = {
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'Boomer BDubs - Watch This',
						description: 'Do you want to flip another coin for your attack?',
						cards: [],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
					onResult(modalResult) {
						if (!modalResult?.result) {
							fortune?.apply(player.entity)
							return
						}

						const flip = flipCoin(game, player, activeHermit)[0]

						if (flip === 'tails') {
							flippedTails = true
							fortune?.apply(player.entity)
							return 'SUCCESS'
						}

						extraDamage += 20

						game.addModalRequest(followUpModal)
					},
					onTimeout() {
						fortune?.apply(player.entity)
					},
				} satisfies SelectCards.Request

				game.addModalRequest({
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'Boomer BDubs - Watch This',
						description: 'Do you want to flip a coin for your attack?',
						cards: [],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
					onResult(modalResult) {
						if (!modalResult) return 'SUCCESS'
						if (!modalResult.result) return 'SUCCESS'

						const flip = flipCoin(game, player, activeHermit)[0]

						observer.subscribe(
							player.hooks.blockedActions,
							(blockedActions) => {
								if (!blockedActions.includes('REMOVE_EFFECT'))
									blockedActions.push('REMOVE_EFFECT')
								return blockedActions
							},
						)

						if (flip === 'tails') {
							flippedTails = true
							return 'SUCCESS'
						}

						extraDamage += 20

						game.addModalRequest(followUpModal)

						// After the first coin flip we remove fortune to prevent infinite coin flips.
						fortune = game.components.find(
							StatusEffectComponent<PlayerComponent>,
							query.effect.is(FortuneEffect, SpentFortuneEffect),
							query.effect.targetIsPlayerAnd(
								(_game, targetPlayer: PlayerComponent) =>
									targetPlayer.entity === player.entity,
							),
						)
						fortune?.remove()

						return 'SUCCESS'
					},
					onTimeout() {},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				observer.unsubscribe(player.hooks.blockedActions)
				if (flippedTails === true) {
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
					return
				}

				attack.addDamage(component.entity, extraDamage)
			},
		)
	},
}

export default BoomerBdubsRare
