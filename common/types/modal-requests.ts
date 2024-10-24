import {CardComponent} from '../components'
import {CardEntity, PlayerEntity} from '../entities'

export type ModalRequest = SelectCards.Request | CopyAttack.Request
export type ModalData = SelectCards.Data | CopyAttack.Data
export type ModalResult = SelectCards.Result | CopyAttack.Result

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
