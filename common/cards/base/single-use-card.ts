import {CardRarityT} from '../../types/cards'
import Card, {CanAttachResult} from './card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {formatText} from '../../utils/formatting'

export type SingleUseDefs = {
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
	description: string
}

class SingleUseCard extends Card {
	public description: string

	constructor(defs: SingleUseDefs) {
		super({
			type: 'single_use',
			id: defs.id,
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.description = defs.description

		this.formattedDescription = formatText(this.description)
	}

	public override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		if (pos.slot.type !== 'single_use') return ['INVALID_SLOT']

		return []
	}

	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		const hasHermit = currentPlayer.board.rows.some((row) => !!row.hermitCard)
		const spaceForSingleUse = !currentPlayer.board.singleUseCard

		return hasHermit && spaceForSingleUse ? ['PLAY_SINGLE_USE_CARD'] : []
	}

	public override showSingleUseTooltip(): boolean {
		return true
	}

	/**
	 * Returns whether this card has apply functionality or not
	 */
	public canApply(): boolean {
		// default is no
		return false
	}

	/**
	 * Returns whether you can attack with this card alone or not
	 */
	public canAttack(): boolean {
		// default is no
		return false
	}
}

export default SingleUseCard
