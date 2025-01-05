import classNames from 'classnames'
import {Deck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {getDeckCost} from 'common/utils/ranks'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'
import {getPlayerDeckCode} from 'logic/session/session-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import EditDeck from './deck-edit'
import SelectDeck from './deck-select'
import css from './deck.module.scss'

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
	const playerDeck = useSelector(getPlayerDeckCode)
	const dispatch = useMessageDispatch()
	const databaseInfo = useSelector(getLocalDatabaseInfo)

	// STATE
	const [mode, setMode] = useState<'select' | 'edit' | 'create'>('select')

	const foundDeck = databaseInfo.decks.find((deck) => deck.code === playerDeck)

	const [loadedDeck, setLoadedDeck] = useState<Deck>(
		playerDeck && foundDeck
			? foundDeck
			: {
					name: '',
					code: '',
					cards: [],
					tags: [],
					iconType: 'item',
					icon: 'any',
					public: false,
				},
	)
	const [filteredDecks, setFilteredDecks] = useState<Array<Deck>>([])

	//DECK LOGIC
	async function saveDeckInternal(deck: Deck) {
		//Save new deck to Database
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: deck,
		})

		//Load new deck
		setLoadedDeck(deck)
		databaseInfo.decks = [...databaseInfo.decks, deck]
	}

	async function updateDeckInternal(deck: Deck) {
		//Save new deck to Database
		dispatch({
			type: localMessages.UPDATE_DECK,
			deck: deck,
		})

		//Load new deck
		setLoadedDeck(deck)
		const oldDeckIndex = databaseInfo.decks.findIndex(
			(oldDeck) => oldDeck.code === deck.code,
		)
		databaseInfo.decks[oldDeckIndex] = deck
	}

	const deleteDeckInternal = (deletedDeck: Deck) => {
		//Save new deck to Database
		dispatch({
			type: localMessages.DELETE_DECK,
			deck: deletedDeck,
		})

		const deckToload = databaseInfo.decks.find(
			(deck) => deck.code !== deletedDeck.code,
		)

		if (deckToload) {
			//Load new deck
			setLoadedDeck(deckToload)
			setActiveDeck(deckToload)
		}
		databaseInfo.decks = databaseInfo.decks.filter(
			(deck) => deck.code !== deletedDeck.code,
		)
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
						updateDeck={(returnedDeck) => updateDeckInternal(returnedDeck)}
						deleteDeck={deleteDeckInternal}
						deck={loadedDeck}
						databaseInfo={databaseInfo}
					/>
				)
			case 'create':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Creation'}
						saveDeck={(returnedDeck) => saveDeckInternal(returnedDeck)}
						updateDeck={(returnedDeck) => updateDeckInternal(returnedDeck)}
						deleteDeck={deleteDeckInternal}
						deck={null}
						databaseInfo={databaseInfo}
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
						databaseInfo={databaseInfo}
						filteredDecks={filteredDecks}
						setFilteredDecks={setFilteredDecks}
					/>
				)
		}
	}

	return router()
}

export default DeckComponent
