import {CardComponent} from '../components'
import {CardEntity, PlayerEntity} from '../entities'

export type ModalRequest =
	| SelectCards.Request
	| CopyAttack.Request
	| DragCards.Request
export type ModalData = SelectCards.Data | CopyAttack.Data | DragCards.Data
export type ModalResult =
	| SelectCards.Result
	| CopyAttack.Result
	| DragCards.Request

export namespace SelectCards {
	export type Request = {
		/** The id of the player to request the pick from */
		player: PlayerEntity
		modal: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result) => void
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	type ButtonVariant = 'default' | 'primary' | 'secondary' | 'error' | 'stone'

	export type Data = {
		type: 'selectCards'
		/** The name of the modal */
		name: string
		/** The description of the modal */
		description: string
		cards: Array<CardEntity>
		/** The amount of cards the player can select. Set to 0 if they do not need to slect cards. */
		selectionSize: number | [min_inclusive: number, max_inclusive: number]
		/** Show a close button on this modal. */
		cancelable: boolean
		primaryButton?: {
			text: string
			variant?: ButtonVariant
		} | null
		secondaryButton?: {
			text: string
			variant?: ButtonVariant
		} | null
	}

	export type Result =
		| {
				result: true
				cards: null | Array<CardComponent>
		  }
		| {
				result: false
				cards: null
		  }
}

export namespace DragCards {
	export type Request = {
		/** The id of the player to request the pick from */
		player: PlayerEntity
		modal: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result) => void
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	export type Data = {
		type: 'dragCards'
		/** The name of the modal */
		name: string
		/** The description of the modal */
		description: string
		/** The cards viewable in the modal, that start on the left */
		leftCards: Array<CardEntity>
		/** The cards viewable in the modal, that start on the right */
		rightCards: Array<CardEntity>
		/**The name of the left area */
		leftAreaName: string
		/**The name of the right area */
		rightAreaName: string
		/**The maximum amount of cards in the left area */
		leftAreaMax: number | null
		/**The maximum amount of cards in the right area */
		rightAreaMax: number | null
	}

	export type Result =
		| {
				result: true
				leftCards: Array<CardComponent>
				rightCards: Array<CardComponent>
		  }
		| {
				result: false
				leftCards: null
				rightCards: null
		  }
}

export namespace CopyAttack {
	export type Request = {
		/** The id of the player to request the pick from */
		player: PlayerEntity
		modal: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result) => void
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	export type Data = {
		type: 'copyAttack'
		name: string
		description: string
		hermitCard: CardEntity
		/** Show a close button on this modal. */
		cancelable: boolean
		/** The actions that can not be used in this modal */
		availableAttacks: Array<'primary' | 'secondary'>
	}

	export type Result =
		| {
				cancel: true
				pick?: undefined
		  }
		| {
				cancel?: undefined
				pick: 'primary' | 'secondary'
		  }
}
