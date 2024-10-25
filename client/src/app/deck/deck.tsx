import classNames from 'classnames'
import {PlayerDeck} from 'common/types/deck'
import {LocalCardInstance} from 'common/types/server-requests'
import {getDeckCost} from 'common/utils/ranks'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {useReducer, useState} from 'react'
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
	const [, forceUpdate] = useReducer((x) => x + 1, 0)

	//DECK LOGIC
	const saveDeckInternal = (deck: PlayerDeck) => {
		//Save new deck to Database
		const savedDeck = toSavedDeck(deck)
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: savedDeck,
		})

		//Load new deck
		setLoadedDeck(savedDeck)
		forceUpdate()
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
		forceUpdate()
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
						databaseInfo={databaseInfo}
						forceUpdate={forceUpdate}
					/>
				)
		}
	}

	return router()
}

export default DeckComponent
