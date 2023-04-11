import classNames from 'classnames'
import {useState, ReactNode} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'common/types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {getTotalCost, validateDeck} from 'server/utils/validation'
import css from './deck.module.scss'
import Accordion from 'components/accordion'
import DeckLayout from './layout'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {PlayerDeckT} from 'common/types/deck'
import EditDeck from './deck-edit'
import Button from 'components/button'
import AlertModal from 'components/alert-modal'
import {DeleteIcon, EditIcon, ErrorIcon, ExportIcon} from 'components/svgs'
import {ToastT} from 'common/types/app'
import {getCardCost} from 'server/utils/validation'
import {ImportExportModal} from 'components/import-export'
import {CONFIG} from '../../../../config'

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

export const sortCards = (cards: Array<CardT>): Array<CardT> => {
	return cards.slice().sort((a: CardT, b: CardT) => {
		const cardInfoA = CARDS[a.cardId]
		const cardInfoB = CARDS[b.cardId]
		const cardCostA = getCardCost(cardInfoA)
		const cardCostB = getCardCost(cardInfoB)

		if (cardInfoA.type !== cardInfoB.type) {
			// types
			return TYPE_ORDER[cardInfoA.type] - TYPE_ORDER[cardInfoB.type]
		} else if (
			// hermit types
			cardInfoA.type === 'hermit' &&
			cardInfoB.type === 'hermit' &&
			cardInfoA.hermitType !== cardInfoB.hermitType
		) {
			return cardInfoA.hermitType.localeCompare(cardInfoB.hermitType)
		} else if (cardCostA !== cardCostB) {
			if (cardInfoA.type === 'item' && cardInfoB.type === 'item') {
				// order items in reverse if they are the same
				if (cardInfoA.name.localeCompare(cardInfoB.name) === 0) {
					return cardCostB - cardCostA
				}
			} else {
				// order by ranks
				return cardCostA - cardCostB
			}
		}

		return cardInfoA.name.localeCompare(cardInfoB.name)
	})
}

export const cardGroupHeader = (title: string, cards: CardT[]) => (
	<p>
		{`${title} `}
		<span style={{fontSize: '0.9rem'}}>
			{`(${cards.length}) `}
			<span className={css.ultraRare}>
				{getTotalCost(cards.map((card) => card.cardId))} tokens
			</span>
		</span>
	</p>
)

export const getSavedDecks = () => {
	let lsKey
	const decks = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			decks.push(key)
		}
	}

	console.log(`Loaded ${decks.length} decks from Local Storage`)
	return decks.sort()
}

export const savedDeckNames = getSavedDecks().map(
	(name) => JSON.parse(name || '')?.name
)

type Props = {
	setMenuSection: (section: string) => void
}

const Deck = ({setMenuSection}: Props) => {
	// REDUX
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const settings = useSelector(getSettings)

	// STATE
	const [mode, setMode] = useState<'select' | 'edit' | 'create'>('select')
	const [savedDecks, setSavedDecks] = useState<any>(getSavedDecks)
	const [importedDeck, setImportedDeck] = useState<PlayerDeckT>({
		name: 'undefined',
		icon: 'any',
		cards: [],
	})
	const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<boolean>(false)
	const [showImportExportModal, setShowImportExportModal] =
		useState<boolean>(false)
	const [showValidateDeckModal, setShowValidateDeckModal] =
		useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({...playerDeck})

	// TOASTS
	const dispatchToast = (toast: ToastT) =>
		dispatch({type: 'SET_TOAST', payload: toast})
	const deleteToast: ToastT = {
		open: true,
		title: 'Deck Deleted!',
		description: `Removed ${loadedDeck.name}`,
		image: `/images/types/type-${loadedDeck.icon}.png`,
	}
	const selectedDeckToast: ToastT = {
		open: true,
		title: 'Deck Selected!',
		description: `${loadedDeck.name} is now your active deck`,
		image: `images/types/type-${loadedDeck.icon}.png`,
	}
	const lastValidDeckToast: ToastT = {
		open: true,
		title: 'Deck Selected!',
		description: `${playerDeck.name} is now your active deck`,
		image: `images/types/type-${playerDeck.icon}.png`,
	}

	// MENU LOGIC
	const backToMenu = () => {
		if (loadedDeck.cards.length != 42) {
			return setShowValidateDeckModal(true)
		}

		dispatchToast(selectedDeckToast)

		dispatch({
			type: 'UPDATE_DECK',
			payload: {
				name: loadedDeck.name,
				icon: loadedDeck.icon,
				cards: loadedDeck.cards.map((card) => card.cardId),
			},
		})
		setMenuSection('mainmenu')
	}
	const handleInvalidDeck = () => {
		setMenuSection('mainmenu')
		dispatchToast(lastValidDeckToast)
	}
	const handleImportDeck = (deck: PlayerDeckT) => {
		setImportedDeck(deck)
		importDeck(deck)
	}

	//DECK LOGIC
	const loadDeck = (deckName: string) => {
		if (!deckName)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)
		const deck: PlayerDeckT = JSON.parse(
			localStorage.getItem('Deck_' + deckName) || '{}'
		)

		const deckIds = deck.cards?.filter((card: CardT) => CARDS[card.cardId])

		setLoadedDeck({
			...deck,
			cards: deckIds,
		})
	}
	const importDeck = (deck: PlayerDeckT) => {
		let deckExists = false
		savedDeckNames.map((name) => {
			if (name === deck.name) {
				console.log(`Name: ${name} | Import: ${deck.name}`)
				deckExists = true
			}
		})
		deckExists && setShowOverwriteModal(true)
		!deckExists && saveDeck(deck)
	}
	const saveDeck = (deck: PlayerDeckT, prevDeck?: PlayerDeckT) => {
		console.log(`prevDeck:`, prevDeck)
		//Remove previous deck from Local Storage
		prevDeck &&
			prevDeck.name !== 'Default' &&
			localStorage.removeItem(`Deck_${prevDeck.name}`)

		//Save new deck to Local Storage
		localStorage.setItem(
			'Deck_' + deck.name,
			JSON.stringify({
				name: deck.name,
				icon: deck.icon,
				cards: deck.cards,
			})
		)

		//Refresh saved deck list and load new deck
		setSavedDecks(getSavedDecks())
		loadDeck(deck.name)
	}
	const deleteDeck = () => {
		dispatchToast(deleteToast)
		localStorage.removeItem('Deck_' + loadedDeck.name)
		setSavedDecks(getSavedDecks())
		loadDeck(JSON.parse(savedDecks[0]).name)
	}
	const deckList: ReactNode = savedDecks.map((d: any, i: number) => {
		const deck: PlayerDeckT = JSON.parse(d)
		return (
			<li
				className={classNames(
					css.myDecksItem,
					loadedDeck.name === deck.name && css.selectedDeck
				)}
				key={i}
				onClick={() => {
					playSwitchDeckSFX()
					loadDeck(deck.name)
				}}
			>
				<div className={css.deckImage}>
					<img
						src={'../images/types/type-' + deck.icon + '.png'}
						alt={'deck-icon'}
					/>
				</div>
				{deck.name}
			</li>
		)
	})
	const validationMessage = validateDeck(
		loadedDeck.cards.map((card) => card.cardId)
	)
	const selectedCards = {
		hermits: loadedDeck.cards.filter(
			(card) => CARDS[card.cardId]?.type === 'hermit'
		),
		items: loadedDeck.cards.filter(
			(card) => CARDS[card.cardId]?.type === 'item'
		),
		effects: loadedDeck.cards.filter(
			(card) =>
				CARDS[card.cardId]?.type === 'effect' ||
				CARDS[card.cardId]?.type === 'single_use'
		),
	}

	//MISC
	const playSwitchDeckSFX = () => {
		if (settings.soundOn !== 'off') {
			const pageTurn = [
				'/sfx/Page_turn1.ogg',
				'/sfx/Page_turn2.ogg',
				'/sfx/Page_turn3.ogg',
			]
			const audio = new Audio(
				pageTurn[Math.floor(Math.random() * pageTurn.length)]
			)
			audio.play()
		}
	}
	const getLegacyDecks = () => {
		for (let i = 0; i < localStorage.length; i++) {
			const lsKey = localStorage.key(i)

			if (lsKey?.includes('Loadout_')) return true
		}
		return false
	}
	const convertLegacyDecks = () => {
		let conversionCount = 0
		for (let i = 0; i < localStorage.length; i++) {
			const lsKey = localStorage.key(i)

			if (lsKey?.includes('Loadout_')) {
				conversionCount = conversionCount + 1
				const legacyName = lsKey.replace('Loadout_', '[Legacy] ')
				const legacyDeck = localStorage.getItem(lsKey)

				const convertedDeck = {
					name: legacyName,
					icon: 'any',
					cards: JSON.parse(legacyDeck || ''),
				}

				localStorage.setItem(
					`Deck_${legacyName}`,
					JSON.stringify(convertedDeck)
				)

				localStorage.removeItem(lsKey)
				console.log(`Converted deck!:`, lsKey, legacyName)
			}
		}

		setSavedDecks(getSavedDecks())

		dispatch({
			type: 'SET_TOAST',
			payload: {
				show: true,
				title: 'Convert Legacy Decks',
				description: conversionCount
					? `Converted ${conversionCount} decks!`
					: `No decks to convert!`,
				image: `/images/card-icon.png`,
			},
		})
	}

	// TODO: Convert to component
	const SelectDeck = () => {
		return (
			<>
				<ImportExportModal
					setOpen={showImportExportModal}
					onClose={() => setShowImportExportModal(!showImportExportModal)}
					importDeck={(deck) => handleImportDeck(deck)}
					loadedDeck={loadedDeck}
				/>
				<AlertModal
					setOpen={showValidateDeckModal}
					onClose={() => setShowValidateDeckModal(!showValidateDeckModal)}
					action={handleInvalidDeck}
					title="Invalid Deck"
					description={`The "${loadedDeck.name}" deck is invalid and cannot be used in
					matches. If you continue, your last valid deck will be used instead.`}
					actionText="Main Menu"
				/>
				<AlertModal
					setOpen={showDeleteDeckModal}
					onClose={() => setShowDeleteDeckModal(!showDeleteDeckModal)}
					action={() => deleteDeck()}
					title="Delete Deck"
					description={`Are you sure you wish to delete the "${loadedDeck.name}" deck?`}
					actionText="Delete"
				/>
				<AlertModal
					setOpen={showOverwriteModal}
					onClose={() => setShowOverwriteModal(!showOverwriteModal)}
					action={() => saveDeck(importedDeck)}
					title="Overwrite Deck"
					description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
					actionText="Overwrite"
				/>

				<DeckLayout title="Deck Selection" back={backToMenu}>
					<DeckLayout.Main
						header={
							<>
								<div className={css.headerGroup}>
									<div className={css.deckImage}>
										<img
											src={
												'../images/types/type-' +
												(!loadedDeck.icon ? 'any' : loadedDeck.icon) +
												'.png'
											}
											alt="deck-icon"
										/>
									</div>
									<p className={css.deckName}>{loadedDeck.name}</p>
									<div className={css.dynamicSpace}></div>

									<p
										className={classNames(
											css.cardCount,
											loadedDeck.cards.length != CONFIG.limits.maxCards
												? css.error
												: null
										)}
									>
										{loadedDeck.cards.length}/{CONFIG.limits.maxCards} cards
									</p>
									<div className={css.cardCount}>
										<p className={css.ultraRare}>
											{getTotalCost(
												loadedDeck.cards.map((card) => card.cardId)
											)}
											/{CONFIG.limits.maxDeckCost} tokens
										</p>
									</div>
								</div>
							</>
						}
					>
						<div className={css.filterGroup}>
							<Button
								variant="default"
								size="small"
								onClick={() => setMode('edit')}
								leftSlot={<EditIcon />}
							>
								Edit Deck
							</Button>
							{loadedDeck.name !== 'Default' && (
								<Button
									variant="error"
									size="small"
									leftSlot={<DeleteIcon />}
									onClick={() => setShowDeleteDeckModal(true)}
								>
									Delete Deck
								</Button>
							)}
						</div>
						{validationMessage && (
							<div className={css.validationMessage}>
								<span style={{paddingRight: '0.5rem'}}>{<ErrorIcon />}</span>{' '}
								{validationMessage}
							</div>
						)}

						<Accordion
							header={cardGroupHeader('Hermits', selectedCards.hermits)}
						>
							<CardList
								cards={sortCards(selectedCards.hermits)}
								size="small"
								wrap={true}
							/>
						</Accordion>

						<Accordion
							header={cardGroupHeader('Effects', selectedCards.effects)}
						>
							<CardList
								cards={sortCards(selectedCards.effects)}
								size="small"
								wrap={true}
							/>
						</Accordion>

						<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
							<CardList
								cards={sortCards(selectedCards.items)}
								size="small"
								wrap={true}
							/>
						</Accordion>
					</DeckLayout.Main>
					<DeckLayout.Sidebar
						header={
							<>
								<img
									src="../images/card-icon.png"
									alt="card-icon"
									className={css.sidebarIcon}
								/>
								<p style={{marginInline: 'auto'}}>My Decks</p>
							</>
						}
						footer={
							<>
								<Button.SplitGroup style={{padding: '0.5rem'}}>
									<Button variant="primary" onClick={() => setMode('create')}>
										Create New Deck
									</Button>
									<Button
										variant="primary"
										onClick={() =>
											setShowImportExportModal(!showImportExportModal)
										}
									>
										<ExportIcon />
									</Button>
								</Button.SplitGroup>
							</>
						}
					>
						{savedDecks.length == 1 && (
							<p style={{fontSize: '0.9rem', padding: '0.5rem'}}>
								Looks like you don't have any decks! Create your own or import
								one from a friend!
							</p>
						)}
						{getLegacyDecks() === true && (
							<Button
								style={{margin: '0.5rem auto'}}
								onClick={convertLegacyDecks}
							>
								Import Legacy Decks
							</Button>
						)}
						{deckList}
					</DeckLayout.Sidebar>
				</DeckLayout>
			</>
		)
	}

	// MODE ROUTER
	const router = () => {
		switch (mode) {
			case 'select':
				return <SelectDeck />
				break
			case 'edit':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Editor'}
						saveDeck={(returnedDeck) => saveDeck(returnedDeck)}
						deck={loadedDeck}
					/>
				)
				break
			case 'create':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Creation'}
						saveDeck={(returnedDeck) => saveDeck(returnedDeck)}
						deck={{
							name: '',
							icon: 'any',
							cards: [],
						}}
					/>
				)
				break
			default:
				return <SelectDeck />
		}
	}

	return router()
}

export default Deck
