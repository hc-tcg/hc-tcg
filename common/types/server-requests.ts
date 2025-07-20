import type {Card} from '../cards/types'
import type {
	CardComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import type {ComponentQuery} from '../components/query'
import {CardEntity, Entity, PlayerEntity, SlotEntity} from '../entities'
import {PlayerId} from '../models/player-model'
import {StatusEffect} from '../status-effects/status-effect'
import {ButtonVariant} from './buttons'
import {SlotTypeT} from './cards'
import {Deck} from './deck'

export type PlayerInfo = {
	playerName: string
	censoredPlayerName: string
	minecraftName: string
	playerId: PlayerId
	playerSecret: string
	playerDeck: Deck | null
}

export type LocalCardInstance<CardType extends Card = Card> = {
	readonly id: CardType['numericId']
	readonly entity: CardEntity
	readonly slot: SlotEntity | null
	readonly attackHint: string | null
	readonly turnedOver: boolean
	readonly prizeCard: boolean
}

export type LocalStatusEffectInstance = {
	readonly id: StatusEffect['id']
	readonly instance: string
	readonly target:
		| {
				type: 'card'
				card: CardEntity
		  }
		| {
				type: 'global'
				player: PlayerEntity
		  }
	readonly counter: number | null
	readonly description: string
}

export type SlotInfo = {
	slotEntity: SlotEntity
	slotType: SlotTypeT
	card: LocalCardInstance | null
}

export type PickRequest = {
	/** The id of the component that created the pick request */
	creator: Entity<any>
	/** The id of the player to request the pick from */
	player: PlayerEntity
	/** The id of the card that called the pick request */
	id: Entity<CardComponent | StatusEffectComponent>
	/** The message to display to the player */
	message: string
	/** A function that returns if the card can be attached to a specific slot */
	canPick: ComponentQuery<SlotComponent>

	/** The function that will be called when we receive a pick result */
	//onResult: (pickedSlot: SlotComponent) => void
	/** Called when the pick request is cancelled. This can only occur with a single use card */
	//onCancel?: () => void
	/** Called when the pick request times out before being resolved successfully */
	//onTimeout?: () => void
}

export type LocalModalData =
	| LocalSelectCards.Data
	| LocalCopyAttack.Data
	| LocalDragCards.Data
export type LocalModalResult =
	| LocalSelectCards.Result
	| LocalCopyAttack.Result
	| LocalDragCards.Result

export namespace LocalSelectCards {
	export type Data = {
		type: 'selectCards'
		name: string
		description: string
		cards: Array<LocalCardInstance>
		selectionSize: number | [min_inclusive: number, max_inclusive: number]
		primaryButton?: {
			text: string
			variant?: ButtonVariant
		} | null
		secondaryButton?: {
			text: string
			variant?: ButtonVariant
		} | null
		cancelable: boolean
	}

	export type Result =
		| {
				result: true
				cards: null | Array<CardEntity>
		  }
		| {
				result: false
				cards: null
		  }
}

export namespace LocalCopyAttack {
	export type Data = {
		type: 'copyAttack'
		name: string
		description: string
		hermitCard: LocalCardInstance
		availableAttacks: Array<'primary' | 'secondary'>
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

export namespace LocalDragCards {
	export type Data = {
		type: 'dragCards'
		name: string
		description: string
		leftCards: Array<LocalCardInstance>
		rightCards: Array<LocalCardInstance>
		leftAreaName: string
		rightAreaName: string
		leftAreaMax: number | null
		rightAreaMax: number | null
	}

	export type Result =
		| {
				result: true
				leftCards: Array<CardEntity>
				rightCards: Array<CardEntity>
		  }
		| {
				result: false
				leftCards: null
				rightCards: null
		  }
}

export type Update = {
	readonly tag: string
	readonly description: string
	readonly link: string
	readonly timestamp: number
}
