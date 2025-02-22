import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

function blockDamage(
	amount: number,
	game: GameModel,
	component: CardComponent,
	observer: ObserverComponent,
) {
	const {player, opponentPlayer} = component

	let damageBlocked = 0

	observer.subscribeWithPriority(
		game.hooks.beforeAttack,
		beforeAttack.EFFECT_REDUCE_DAMAGE,
		(attack) => {
			if (!attack.isTargeting(component) || attack.isType('status-effect'))
				return

			if (damageBlocked < amount) {
				const damageReduction = Math.min(
					attack.calculateDamage(),
					amount - damageBlocked,
				)
				damageBlocked += damageReduction
				attack.addDamageReduction(component.entity, damageReduction)
			}
		},
	)

	const resetCounter = () => {
		damageBlocked = 0
	}

	// Reset counter at the start of every turn
	observer.subscribe(player.hooks.onTurnStart, resetCounter)
	observer.subscribe(opponentPlayer.hooks.onTurnStart, resetCounter)
}

function blockEffect(
	amount: number | null,
	game: GameModel,
	component: CardComponent,
	observer: ObserverComponent,
) {
	observer.subscribeWithPriority(
		game.hooks.beforeAttack,
		beforeAttack.EFFECT_BLOCK_DAMAGE,
		(attack) => {
			if (!attack.isTargeting(component)) {
				return
			}
			if (attack.isType('effect')) {
				if (amount !== null) {
					attack.removeDamage(component.entity, amount)
				} else {
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
				}
			}
		},
	)
}

function blockSingleUseRedirect(
	game: GameModel,
	component: CardComponent,
	observer: ObserverComponent,
) {
	observer.subscribeWithPriority(
		game.hooks.beforeAttack,
		beforeAttack.EFFECT_BLOCK_DAMAGE,
		(attack) => {
			if (!attack.isTargeting(component)) {
				return
			}

			// only protect against su attacks and attacks which have been redirected by su cards
			let suRedirect = false

			const lastTargetChange = attack.getHistory('redirect').pop()
			if (lastTargetChange) {
				// This attack has been redirected to us by a su card
				suRedirect = true
			}

			if (suRedirect) {
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}
		},
	)
}

function blockKnockback(component: CardComponent, observer: ObserverComponent) {
	observer.subscribe(component.player.hooks.blockKnockback, () => {
		if (!component.slot.inRow()) return false
		return component.slot.row.entity === component.player.activeRowEntity
	})
}

export const GoldArmor: Attach = {
	...attach,
	id: 'gold_armor',
	numericId: 29,
	name: 'Gold Armour',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 10hp each turn.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		return blockDamage(10, game, component, observer)
	},
}

export const IronArmor: Attach = {
	...attach,
	id: 'iron_armor',
	numericId: 45,
	name: 'Iron Armour',
	expansion: 'default',
	rarity: 'common',
	tokens: 2,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		return blockDamage(20, game, component, observer)
	},
}

export const ChainmailArmor: Attach = {
	...attach,
	id: 'chainmail_armor',
	numericId: 119,
	name: 'Chainmail Armour',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	description:
		'Prevents any damage from effect cards and any damage redirected by effect cards to the Hermit this card is attached to.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		blockEffect(null, game, component, observer)
		blockSingleUseRedirect(game, component, observer)
	},
}

export const DiamondArmor: Attach = {
	...attach,
	id: 'diamond_armor',
	numericId: 13,
	name: 'Diamond Armour',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn. Also prevents up to an additional 20hp damage from effect cards.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		blockEffect(20, game, component, observer)
		blockDamage(20, game, component, observer)
	},
}

export const NetheriteArmor: Attach = {
	...attach,
	id: 'netherite_armor',
	numericId: 82,
	name: 'Netherite Armour',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 4,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn. Also prevents any damage from effect cards. Opponent can not make this Hermit go AFK.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		blockEffect(null, game, component, observer)
		blockDamage(20, game, component, observer)
		blockKnockback(component, observer)
	},
}
