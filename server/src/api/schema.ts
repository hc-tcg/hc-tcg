import {CARDS} from 'common/cards'
import {Card} from 'common/cards/base/types'
import {z} from 'zod'

export const CardId = z.custom<Card['id']>((val) => {
	return typeof val === 'string' && val in CARDS
})

export const ListOfCards = z.array(CardId)

export const CancelGameBody = z.object({
	code: z.string(),
})
