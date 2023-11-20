import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {HERMIT_CARDS} from '..'
import {discardCard} from '../../utils/movement'
import {CardPosModel} from '../../models/card-pos-model'

class BedEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'bed',
			numericId: 2,
			name: 'Bed',
			rarity: 'ultra_rare',
			description:
				"Player sleeps for the rest of this and next 2 turns. Can't attack. Restores full health when bed is attached.\n\nCan still draw and attach cards while sleeping.\n\nMust be placed on active Hermit.\n\nDiscard after player wakes up.\n\n\n\nCan not go AFK while sleeping.\n\nIf made AFK by opponent player, Hermit goes AFK but also wakes up.",
		})
	}
	override canAttach(game: GameModel, pos: CardPosModel) {
		const {currentPlayer} = game

		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		// bed addition - hermit must also be active to attach
		if (!(currentPlayer.board.activeRow === pos.rowIndex)) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos
		const hermitSlot = this.getInstanceKey(instance, 'hermitSlot')

		if (row && row.hermitCard) {
			row.health = HERMIT_CARDS[row.hermitCard.cardId].health

			// Clear any previous sleeping
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

			// Set new sleeping for 3 turns (2 + the current turn)
			row.ailments.push({id: 'sleeping', duration: 3})
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart.add(instance, () => {
			const isSleeping = row?.ailments.some((a) => a.id === 'sleeping')
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				return
			}
		})

		player.hooks.beforeApply.add(instance, (pickedSlots) => {
			player.custom[hermitSlot] = row?.hermitCard?.cardInstance
		})

		//Ladder
		player.hooks.afterApply.add(instance, (pickedSlots) => {
			if (player.custom[hermitSlot] != row?.hermitCard?.cardInstance && row && row.hermitCard) {
				row.health = HERMIT_CARDS[row.hermitCard.cardId].health

				// Clear any previous sleeping
				row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

				// Set new sleeping for 3 turns (2 + the current turn)
				row.ailments.push({id: 'sleeping', duration: 3})
			}
			delete player.custom[hermitSlot]
		})

		player.hooks.onTurnEnd.add(instance, () => {
			const isSleeping = row?.ailments.some((a) => a.id === 'sleeping')

			// if sleeping has worn off, discard the bed
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				player.hooks.onTurnEnd.remove(instance)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		player.hooks.beforeApply.remove(instance)
		player.hooks.afterApply.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'hermitSlot')]
	}
}

export default BedEffectCard
