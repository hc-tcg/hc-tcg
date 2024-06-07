import {PlayCardLog, CardRarityT, CardTypeT} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {FormattedTextNode, TextNode} from '../../utils/formatting'

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

	/** The battle log attached to this card */
	/** Set to string when the card should generate a log when played or applied, and null otherwise */
	private log: Array<(values: PlayCardLog) => string>

	constructor(defs: CardDefs) {
		this.type = defs.type
		this.id = defs.id
		this.numericId = defs.numericId
		this.name = defs.name
		this.rarity = defs.rarity
		this.log = []
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
	 * Returns the description for this card that shows up in the sidebar.
	 */
	public abstract getFormattedDescription(): FormattedTextNode

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
	 * Returns the sidebar descriptions for this card
	 */
	public sidebarDescriptions(): Array<Record<string, string>> {
		return []
	}

	/** Updates the log entry*/
	public updateLog(logEntry: (values: PlayCardLog) => string) {
		if (logEntry === null) return
		this.log.push(logEntry)
	}

	private consolidateLogs(values: PlayCardLog, logIndex: number) {
		if (logIndex > 0) {
			values.previousLog = this.consolidateLogs(values, logIndex - 1)
		}
		return this.log[logIndex](values)
	}

	/** Gets the log entry for this attack*/
	public getLog(values: PlayCardLog) {
		if (this.log.length === 0) {
			return ''
		}
		return this.consolidateLogs(values, this.log.length - 1)
	}
}

export default Card
