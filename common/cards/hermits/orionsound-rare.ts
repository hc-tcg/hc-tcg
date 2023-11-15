import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'

class OrionSoundRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'orionsound_rare',
			numericId: 155,
			name: 'Ollie',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 260,
			primary: {
				name: 'Concert',
				cost: ['speedrunner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Melody',
				cost: ['speedrunner', 'speedrunner'],
				damage: 0,
				power: 'Heal all allied AFK Hermits 30hp. Heal all opposing AFK Hermits 10hp',
			},
		})
	}

	public override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const {player, opponentPlayer} = pos

			for (let i = 0; i < player.board.rows.length; i++) {
				if (i == player.board.activeRow) continue
				const row = player.board.rows[i]
				if (!row.hermitCard) continue
				const hermitInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (hermitInfo) {
					row.health = Math.min(row.health + 30, hermitInfo.health)
				} else {
					// Armor Stand
					row.health += 30
				}
			}

			for (let i = 0; i < opponentPlayer.board.rows.length; i++) {
				if (i == opponentPlayer.board.activeRow) continue
				const row = opponentPlayer.board.rows[i]
				if (!row.hermitCard) continue
				const hermitInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (hermitInfo) {
					row.health = Math.min(row.health + 10, hermitInfo.health)
				} else {
					// Armor Stand
					row.health += 10
				}
			}
		})
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}
}

export default OrionSoundRareHermitCard
