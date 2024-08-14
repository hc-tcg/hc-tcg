import {CardComponent} from '../components'
import {CardEntity, PlayerEntity} from '../entities'

export type ModalRequest = SelectCards.Request | CopyAttack.Request
export type ModalData = SelectCards.Data | CopyAttack.Data
export type ModalResult = SelectCards.Result | CopyAttack.Result

export namespace SelectCards {
	export type Request = {
		/** The id of the player to request the pick from */
		player: PlayerEntity
		data: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result | undefined) => void
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	type ButtonVariant = 'default' | 'primary' | 'secondary' | 'error' | 'stone'

	export type Data = {
		modalId: 'selectCards'
		payload: {
			modalName: string
			modalDescription: string
			cards: Array<CardEntity>
			selectionSize: number
			primaryButton?: {
				text: string
				variant?: ButtonVariant
			} | null
			secondaryButton?: {
				text: string
				variant?: ButtonVariant
			} | null
		}
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
		data: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result | undefined) => void
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	export type Data = {
		modalId: 'copyAttack'
		payload: {
			modalName: string
			modalDescription: string
			hermitCard: CardEntity
		}
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
