import {getDeckFromHash} from '../utils/import-export'
import {Card} from './types'

export const STARTER_DECKS = [
	'VVXCrsOww7DCscKxHBzCrkNDQ0NDQ0NDRETCucK5wrlDQ0MHBxgYHwzCixJ3TQ0EKwbClQM=',
	'a2trdHTCtsOuwqDCoMKnPj4+Pj4+PT09PT09PcK5wrnCuU1NwpAsGBh3GRESDMKPKnl3Kw==',
	'BwcNDQ0OGhoaKjExMTExMTExMTExMTExMjIySUlkZGRmZsKAwoDChsKGwobClcKXwpc=',
].map((deck) => getDeckFromHash(deck).map((card) => card.props))

export function getStarterPack(): Array<Card> {
	return STARTER_DECKS[Math.floor(Math.random() * STARTER_DECKS.length)]
}
