import {CardRarityT, CardTypeT} from '../../types/cards'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {HermitAttackType} from '../../types/attack'
import {PickRequest} from '../../types/server-requests'

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

	constructor(defs: CardDefs) {
		this.type = defs.type
		this.id = defs.id
		this.numericId = defs.numericId
		this.name = defs.name
		this.rarity = defs.rarity
	}

	public getKey(keyName: string) {
		return this.id + ':' + keyName
	}
	public getInstanceKey(instance: string, keyName: string = '') {
		return this.id + ':' + instance + ':' + keyName
	}

	/**
	 * If the specified slot is empty, can this card be attached there
	 */
	public abstract canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID'

	/**
	 * If this card is attached to a Hermit slot, can another card be attached to the row this card is in
	 */
	public canAttachToCard(game: GameModel, pos: CardPosModel): boolean {
		// default is true
		return true
	}

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

	//@TODO implement
	/**
	 * Returns pick requests to be executed before the attack loop
	 */
	public getPickRequests(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	): Array<PickRequest> {
		// Default is nothing
		return []
	}

	/**
	 * Returns the actions this card makes available when in the hand
	 */
	public getActions(game: GameModel): TurnActions {
		// default is to return nothing
		return []
	}
}

export default Card
