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
import {setActiveDeck, toSavedDeck} from 'logic/saved-decks/saved-decks'
import {Deck} from 'common/types/database'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'

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

	const databaseInfo = useSelector(getLocalDatabaseInfo)

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

	const deleteDeckInternal = (deletedDeck: Deck) => {
		//Save new deck to Database
		const deckToDelete = databaseInfo.decks.find(
			(deck) => deck.name === deletedDeck.name,
		)
		if (!deckToDelete) return
		dispatch({
			type: localMessages.DELETE_DECK,
			deck: deckToDelete,
		})
		setRemovedDecks([...removedDecks, deckToDelete])

		const deckToload = databaseInfo.decks.find(
			(deck) => deck.name !== deletedDeck.name,
		)

		if (deckToload) {
			//Load new deck
			setLoadedDeck(deckToload)
			setActiveDeck(deckToload)
		}
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
						deleteDeck={deleteDeckInternal}
						deck={loadedDeck}
					/>
				)
			case 'create':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Creation'}
						saveDeck={(returnedDeck) => saveDeckInternal(returnedDeck)}
						deleteDeck={deleteDeckInternal}
						deck={null}
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
						removedDecks={removedDecks}
					/>
				)
		}
	}

	return router()
}

export default DeckComponent
