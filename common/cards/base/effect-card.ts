import Card from './card'
import {CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardRarityT} from '../../types/cards'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'

type EffectDefs = {
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
	description: string
}

abstract class EffectCard extends Card {
	public description: string

	constructor(defs: EffectDefs) {
		super({
			type: 'effect',
			id: defs.id,
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.description = defs.description
	}

	public override canAttach(
		game: GameModel,
		pos: CardPosModel
	): 'YES' | 'MOVE_ONLY' | 'NO' | 'INVALID' {
		const {currentPlayer} = game

		// Wrong slot
		if (pos.slot.type !== 'effect') return 'INVALID'

		// Can't attach without hermit card - this is considered like the wrong slot
		if (!pos.row?.hermitCard) return 'INVALID'

		const cardInfo = CARDS[pos.row.hermitCard?.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		if (pos.player.id !== currentPlayer.id) return 'MOVE_ONLY'
		return 'YES'
	}

	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there is a hermit on the board with space for an effect card
		const spaceForEffect = currentPlayer.board.rows.some((row) => {
			return !!row.hermitCard && !row.effectCard
		})

		return spaceForEffect ? ['PLAY_EFFECT_CARD'] : []
	}

	public override showAttachTooltip() {
		return true
	}

	/**
	 * Returns whether this card is removable from its position
	 */
	public getIsRemovable(): boolean {
		// default
		return true
	}
}

export default EffectCard
