import {CardRarityT, CardTypeT} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {FormattedSegment, TurnActions} from '../../types/game-state'

export type CanAttachError =
	| 'INVALID_PLAYER'
	| 'INVALID_SLOT'
	| 'UNMET_CONDITION'
	| 'UNMET_CONDITION_SILENT'
	| 'UNKNOWN_ERROR'

export type CanAttachResult = Array<CanAttachError>

type CardDefs = {
	type: CardTypeT
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
}

abstract class Card {
	public type: CardTypeT
	public id: string
	public numericId: number
	public name: string
	public rarity: CardRarityT

	protected description: Array<FormattedSegment>

	constructor(defs: CardDefs) {
		this.type = defs.type
		this.id = defs.id
		this.numericId = defs.numericId
		this.name = defs.name
		this.rarity = defs.rarity
		this.description = []
	}

	public getKey(keyName: string) {
		return this.id + ':' + keyName
	}
	public getInstanceKey(instance: string, keyName: string = '') {
		return this.id + ':' + instance + ':' + keyName
	}

	/**
	 * If the specified slot is empty, can this card be attached there
	 *
	 * Returns an array of any of the problems there are with attaching, if any
	 */
	public abstract canAttach(game: GameModel, pos: CardPosModel): CanAttachResult

	/**
	 * Called when an instance of this card is attached to the board
	 */
	public onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when an instance of this card is removed from the board
	 */
	public onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Returns the expansion this card is a part of
	 */
	public getExpansion(): string {
		return 'default'
	}

	/**
	 * Returns the palette to use for this card
	 */
	public getPalette(): string {
		return 'default'
	}

	/**
	 * Returns the shortened name to use for this card
	 */
	public getShortName(): string {
		return this.name
	}

	/**
	 * Returns whether to show *Attach* on the card tooltip
	 */
	public showAttachTooltip(): boolean {
		return false
	}

	/**
	 * Returns whether to show *Single Use* on the card tooltip
	 */
	public showSingleUseTooltip(): boolean {
		return false
	}

	/**
	 * Returns the actions this card makes available when in the hand
	 */
	public getActions(game: GameModel): TurnActions {
		// default is to return nothing
		return []
	}

	/**
	 * Returns the description for this card
	 */
	public getFormattedDescription(): Array<Record<string, string>> {
		return this.description
	}

	/**
	 * Returns the sidebar descriptions for this card
	 */
	public sidebarDescriptions(): Array<Record<string, string>> {
		return []
	}
}

export default Card
