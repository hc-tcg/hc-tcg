import type {CardProps} from '../cards/base/types'
import type {ComponentQuery} from '../components/query'
import type {CardComponent, SlotComponent, StatusEffectComponent} from '../components'
import {StatusEffectProps} from '../status-effects/status-effect'
import {SlotTypeT} from './cards'
import {PlayerDeckT} from './deck'
import {PlayerId} from '../models/player-model'
import {CardEntity, Entity, PlayerEntity, SlotEntity} from '../entities'
import {TurnActions} from './game-state'

export type PlayerInfo = {
	playerName: string
	censoredPlayerName: string
	minecraftName: string
	playerId: string
	playerSecret: string
	playerDeck: PlayerDeckT
}

/* A type to remove functions from.props to prevent issues when sending cards to the cient */
export type WithoutFunctions<Type> = {
	[Property in keyof Type]: Type[Property] extends Function ? never : Type[Property]
}

export function WithoutFunctions<T>(t: T): WithoutFunctions<T> {
	return t as WithoutFunctions<T>
}

export type LocalCardInstance<Props extends CardProps = CardProps> = {
	readonly props: WithoutFunctions<Props>
	readonly entity: CardEntity
	readonly slot: SlotEntity | null
}

export type LocalStatusEffectInstance<Props extends StatusEffectProps = StatusEffectProps> = {
	readonly props: WithoutFunctions<Props>
	readonly instance: string
	readonly target:
		| {
				type: 'card'
				card: CardEntity
		  }
		| {
				type: 'player'
				player: PlayerEntity
		  }
	readonly counter: number | null
}

export type SlotInfo = {
	slotEntity: SlotEntity
	slotType: SlotTypeT
	card: LocalCardInstance | null
}

export type PickRequest = {
	/** The id of the player to request the pick from */
	playerId: PlayerId
	/** The id of the card that called the pick request */
	id: Entity<CardComponent | StatusEffectComponent>
	/** The message to display to the player */
	message: string
	/** A function that returns if the card can be attached to a specific slot */
	canPick: ComponentQuery<SlotComponent>
	/** The function that will be called when we receive a pick result */
	onResult: (pickedSlot: SlotComponent) => void
	/** Called when the pick request is cancelled. This can only occur with a single use card */
	onCancel?: () => void
	/** Called when the pick request times out before being resolved successfully */
	onTimeout?: () => void
}

export type LocalModalData = LocalSelectCards.Data | LocalCopyAttack.Data
export type LocalModalResult = LocalSelectCards.Result | LocalCopyAttack.Result

export namespace LocalSelectCards {
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
				cards: null | Array<CardEntity>
		  }
		| {
				result: false
				cards: null
		  }
}

export namespace LocalCopyAttack {
	export type Data = {
		modalId: 'copyAttack'
		payload: {
			modalName: string
			modalDescription: string
			hermitCard: LocalCardInstance
			blockedActions: TurnActions
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
