import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {canBecomeActive} from '../../components/query/slot'
import {GameModel} from '../../models/game-model'
import FortuneEffect from '../../status-effects/fortune'
import SpentFortuneEffect from '../../status-effects/spent-fortune'
import {ModalRequest} from '../../types/modal-requests'
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
	data: () => {
		return {
			extraDamage: 0,
			flippedTalis: false,
			blockRemoveEffect: false,
		}
	},
	onCreate(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		let modalRequest = {
			creator: component.entity,
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
			onTimeout() {},
		} satisfies ModalRequest

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				component.data.extraDamage = 0
				component.data.flippedTails = false
			},
		)

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				game.addModalRequest(modalRequest)
			},
		)

		observer.subscribe(
			game.hooks.onSelectCardsModalResolve,
			(modalRequest, modalResult) => {
				if (modalRequest.creator !== component.entity) return
				let activeHermit = component.player.getActiveHermit()
				if (!activeHermit) return

				if (modalResult.result === false) return

				const flip = flipCoin(game, player, activeHermit)[0]

				component.data.blockRemoveEffect = true

				if (flip === 'tails') {
					component.data.flippedTails = true
					return
				}

				component.data.extraDamage += 20

				game.addModalRequest(modalRequest)

				// After the first coin flip we remove fortune to prevent infinite coin flips.
				const fortune = game.components.find(
					StatusEffectComponent<PlayerComponent>,
					query.effect.is(FortuneEffect, SpentFortuneEffect),
					query.effect.targetIsPlayerAnd(
						(_game, targetPlayer: PlayerComponent) =>
							targetPlayer.entity === player.entity,
					),
				)
				fortune?.remove()
			},
		)

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			if (!component.data.blockRemoveEffect) return blockedActions
			if (!blockedActions.includes('REMOVE_EFFECT'))
				blockedActions.push('REMOVE_EFFECT')
			return blockedActions
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!component.onGameBoard) return
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				component.data.blockRemoveEffect = false
				if (component.data.flippedTails === true) {
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
					return
				}

				attack.addDamage(component.entity, component.data.extraDamage)
			},
		)
	},
}

export default BoomerBdubsRare
