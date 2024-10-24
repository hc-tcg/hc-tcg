import classNames from 'classnames'
import {EditedDeck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {getDeckCost} from 'common/utils/ranks'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import EditDeck from './deck-edit'
import SelectDeck from './deck-select'
import css from './deck.module.scss'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {toEditDeck, toSavedDeck} from 'logic/saved-decks/saved-decks'
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
	const [extraDecks, setExtraDecks] = useState<Array<Deck>>([])
	const [removedDecks, setRemovedDecks] = useState<Array<Deck>>([])

	//DECK LOGIC
	const saveDeckInternal = (deck: EditedDeck) => {
		//Save new deck to Database
		const savedDeck = toSavedDeck(deck)
		setExtraDecks([...extraDecks, savedDeck])
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: savedDeck,
		})

		//Load new deck
		setLoadedDeck(savedDeck)
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
						deck={toEditDeck(loadedDeck)}
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
						extraDecks={extraDecks}
					/>
				)
		}
	}

	return router()
}

export default DeckComponent
