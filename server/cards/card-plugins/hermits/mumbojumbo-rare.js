import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

class MumboJumboRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'mumbojumbo_rare',
			name: 'Mumbo',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 290,
			primary: {
				name: 'Moustache',
				cost: ['prankster'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Quite Simple',
				cost: ['prankster', 'prankster'],
				damage: 40,
				power:
					'Flip a Coin twice.\n\n+40 HP damage for every heads.\n\nTotal damage doubles if at least 1 other Prankster type is AFK.\n\nIf player does not roll heads at least once, the above does not apply.',
			},
		})

		this.heal = 40
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				typeAction,
				currentPlayer,
				attackerActiveRow,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer, 2)
			currentPlayer.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			target.damage += 40 * headsAmount

			if (headsAmount === 0) return target
			const hasAfkPranskter = currentPlayer.board.rows.some((row, index) => {
				const isAfk = index !== currentPlayer.board.activeRow
				const isPranskter =
					CARDS[row.hermitCard?.cardId]?.hermitType === 'prankster'
				return isAfk && isPranskter
			})
			if (!hasAfkPranskter) return target
			target.multiplier *= 2

			return target
		})
	}
}

export default MumboJumboRareHermitCard
