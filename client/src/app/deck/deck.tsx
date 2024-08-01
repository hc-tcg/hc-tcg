import classNames from 'classnames'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './deck.module.scss'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {PlayerDeckT} from 'common/types/deck'
import EditDeck from './deck-edit'
import SelectDeck from './deck-select'
import {getDeckCost} from 'common/utils/ranks'
import {saveDeck} from 'logic/saved-decks/saved-decks'
import {LocalCardInstance} from 'common/types/server-requests'

export const cardGroupHeader = (title: string, cards: Array<LocalCardInstance>) => (
	<p className={css.cardGroupHeader}>
		{`${title} `}
		<span style={{fontSize: '0.9rem'}}>{`(${cards.length}) `}</span>
		<span className={classNames(css.tokens, css.tokenHeader)}>{getDeckCost(cards)} tokens</span>
	</p>
)

type Props = {
	setMenuSection: (section: string) => void
}

const Deck = ({setMenuSection}: Props) => {
	// REDUX
	const playerDeck = useSelector(getPlayerDeck)

	// STATE
	const [mode, setMode] = useState<'select' | 'edit' | 'create'>('select')

	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({...playerDeck})

	//DECK LOGIC
	const saveDeckInternal = (deck: PlayerDeckT) => {
		//Save new deck to Local Storage
		saveDeck(deck)

		//Load new deck
		setLoadedDeck({
			...deck,
			cards: deck.cards,
		})
	}

	// MODE ROUTER
	const router = () => {
		switch (mode) {
			case 'edit':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Editor'}
						saveDeck={(returnedDeck) => saveDeckInternal(returnedDeck)}
						deck={loadedDeck}
					/>
				)
			case 'create':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Creation'}
						saveDeck={(returnedDeck) => saveDeckInternal(returnedDeck)}
						deck={{
							name: '',
							icon: 'any',
							cards: [],
						}}
					/>
				)
			case 'select':
			default:
				return (
					<SelectDeck
						setLoadedDeck={setLoadedDeck}
						setMenuSection={setMenuSection}
						setMode={setMode}
						loadedDeck={loadedDeck}
					/>
				)
		}
	}

	return router()
}

export default Deck
