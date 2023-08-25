import {CardRarityT} from '../../types/cards'
import Card from './card'
import {PickRequirmentT} from '../../types/pick-process'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'

export type SingleUseDefs = {
	id: string
	numeric_id: number
	name: string
	rarity: CardRarityT
	description: string
	pickOn?: 'attack' | 'apply'
	pickReqs?: Array<PickRequirmentT>
}

class SingleUseCard extends Card {
	public description: string

	constructor(defs: SingleUseDefs) {
		super({
			type: 'single_use',
			id: defs.id,
			numeric_id: defs.numeric_id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		this.description = defs.description
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		return 'YES'
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
