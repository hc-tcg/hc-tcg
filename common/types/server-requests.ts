import type {CardProps} from '../cards/base/types'
import type {ComponentQuery} from '../components/query'
import type {SlotComponent} from '../components'
import {StatusEffectProps} from '../status-effects/status-effect'
import {SlotTypeT} from './cards'
import {ActionResult, CardEntity, SlotEntity} from './game-state'

/* A type to remove functions from.props to prevent issues when sending cards to the cient */
export type WithoutFunctions<Type> = {
	[Property in keyof Type]: Type[Property] extends Function ? never : Type[Property]
}

export function WithoutFunctions<T>(t: T): WithoutFunctions<T> {
	return t as WithoutFunctions<T>
}

export type LocalCardInstance<Props extends CardProps = CardProps> = {
	readonly props: WithoutFunctions<Props>
	readonly instance: CardEntity
	readonly slot: SlotEntity | null
}

export type LocalStatusEffectInstance<Props extends StatusEffectProps = StatusEffectProps> = {
	readonly props: WithoutFunctions<Props>
	readonly instance: string
	readonly targetInstance: LocalCardInstance
	readonly counter: number | null
}

export type PickInfo = {
	entity: SlotEntity
	type: SlotTypeT
}

export type PickRequest = {
	/** The id of the player to request the pick from */
	playerId: string
	/** The id of the card that called the pick request */
	id: string
	/** The message to display to the player */
	message: string
	/** A function that returns if the card can be attached to a specific slot */
	canPick: ComponentQuery<SlotComponent>
	/** The function that will be called when we receive a pick result. This will return whether this was a success or not*/
	onResult: (pickedSlot: SlotComponent) => void //
	/** Called when the pick request is cancelled. This can only occur with a single use card */
	onCancel?: () => void
	/** Called when the pick request times out before being resolved successfully */
	onTimeout?: () => void
}

export type ModalRequest = SelectCards.Request | CopyAttack.Request
export type ModalData = SelectCards.Data | CopyAttack.Data
export type ModalResult = SelectCards.Result | CopyAttack.Result

export namespace SelectCards {
	export type Request = {
		/** The id of the player to request the pick from */
		playerId: string
		data: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result | undefined) => ActionResult
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	type ButtonVariant = 'default' | 'primary' | 'secondary' | 'error' | 'stone'

	export type Data = {
		modalId: 'selectCards'
		payload: {
			modalName: string
			modalDescription: string
			cards: Array<LocalCardInstance>
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
				cards: null | LocalCardInstance[]
		  }
		| {
				result: false
				cards: null
		  }
}

export namespace CopyAttack {
	export type Request = {
		/** The id of the player to request the pick from */
		playerId: string
		data: Data
		/** The function that will be called when we receive a modal result. This will return whether this was a success or not*/
		onResult: (modalResult: Result | undefined) => ActionResult
		/** Called when the modal request times out before being resolved successfully */
		onTimeout: () => void
	}

	export type Data = {
		modalId: 'copyAttack'
		payload: {
			modalName: string
			modalDescription: string
			hermitCard: LocalCardInstance
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
