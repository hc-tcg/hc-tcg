import classNames from 'classnames'
import {UnsavedDeck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {getDeckCost} from 'common/utils/ranks'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import EditDeck from './deck-edit'
import SelectDeck from './deck-select'
import css from './deck.module.scss'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {toSavedDeck} from 'logic/saved-decks/saved-decks'
import {Deck} from 'common/types/database'

export const cardGroupHeader = (
	title: string,
	cards: Array<LocalCardInstance>,
) => (
	<p className={css.cardGroupHeader}>
		{`${title} `}
		<span style={{fontSize: '0.9rem'}}>{`(${cards.length}) `}</span>
		<span className={classNames(css.tokens, css.tokenHeader)}>
			{getDeckCost(cards.map((card) => card.props))} tokens
		</span>
	</p>
)

type Props = {
	setMenuSection: (section: string) => void
}

const DeckComponent = ({setMenuSection}: Props) => {
	// REDUX
	const playerDeck = useSelector(getPlayerDeck)
	const dispatch = useMessageDispatch()

	// STATE
	const [mode, setMode] = useState<'select' | 'edit' | 'create'>('select')

	const [loadedDeck, setLoadedDeck] = useState<Deck>(toSavedDeck(playerDeck))

	//DECK LOGIC
	const saveDeckInternal = (deck: UnsavedDeck) => {
		//Save new deck to Database
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: toSavedDeck(deck),
		})

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
							tags: [],
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

export default DeckComponent
