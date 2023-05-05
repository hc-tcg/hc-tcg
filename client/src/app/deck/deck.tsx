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
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ErrorIcon,
	ExportIcon,
} from 'components/svgs'
import {ToastT} from 'common/types/app'
import {getCardCost} from 'server/utils/validation'
import {ImportModal, ExportModal} from 'components/import-export'
import {CONFIG} from '../../../../config'
import {
	convertLegacyDecks,
	deleteDeck,
	getLegacyDecks,
	getSavedDeck,
	getSavedDecks,
	saveDeck,
	setActiveDeck,
} from 'logic/saved-decks/saved-decks'

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
	<p className={css.cardGroupHeader}>
		{`${title} `}
		<span style={{fontSize: '0.9rem'}}>{`(${cards.length}) `}</span>
		<span className={classNames(css.tokens, css.tokenHeader)}>
			{getTotalCost(cards.map((card) => card.cardId))} tokens
		</span>
	</p>
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
	const [savedDecks, setSavedDecks] = useState<Array<string>>(getSavedDecks)

	const savedDeckNames = savedDecks.map((deck) =>
		deck ? getSavedDeck(deck)?.name : null
	)
	const [importedDeck, setImportedDeck] = useState<PlayerDeckT>({
		name: 'undefined',
		icon: 'any',
		cards: [],
	})
	const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<boolean>(false)
	const [showDuplicateDeckModal, setShowDuplicateDeckModal] =
		useState<boolean>(false)
	const [showImportModal, setShowImportModal] = useState<boolean>(false)
	const [showExportModal, setShowExportModal] = useState<boolean>(false)
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
		if (validateDeck(loadedDeck.cards.map((card) => card.cardId))) {
			return setShowValidateDeckModal(true)
		}

		setActiveDeck(loadedDeck.name)
		dispatchToast(selectedDeckToast)

		dispatch({
			type: 'UPDATE_DECK',
			payload: loadedDeck,
		})
		setMenuSection('mainmenu')
	}
	const handleInvalidDeck = () => {
		saveDeck(playerDeck)
		setMenuSection('mainmenu')
		dispatchToast(lastValidDeckToast)
	}
	const handleImportDeck = (deck: PlayerDeckT) => {
		setImportedDeck(deck)
		importDeck(deck)
		setShowImportModal(false)
	}

	//DECK LOGIC
	const loadDeck = (deckName: string) => {
		if (!deckName)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)
		const deck = getSavedDeck(deckName)
		if (!deck)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)

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
		!deckExists && saveDeckInternal(deck)
	}
	const saveDeckInternal = (deck: PlayerDeckT) => {
		//Save new deck to Local Storage
		saveDeck(deck)

		//Refresh saved deck list and load new deck
		setSavedDecks(getSavedDecks())
		loadDeck(deck.name)
	}
	const deleteDeckInternal = () => {
		dispatchToast(deleteToast)
		deleteDeck(loadedDeck.name)
		const decks = getSavedDecks()
		setSavedDecks(decks)
		loadDeck(JSON.parse(decks[0]).name)
	}
	const canDuplicateDeck = () => {
		return !getSavedDeck(`${loadedDeck.name} Copy 9`)
	}
	const duplicateDeck = (deck: PlayerDeckT) => {
		//Save duplicated deck to Local Storage
		let newName = `${deck.name} Copy`
		let number = 2

		while (getSavedDeck(newName)) {
			if (number > 9) return
			newName = `${deck.name} Copy ${number}`
			number++
		}
		saveDeck({...deck, name: newName})

		//Refresh saved deck list and load new deck
		setSavedDecks(getSavedDecks())
	}
	const sortedDecks = savedDecks
		.map((d: any, i: number) => {
			const deck: PlayerDeckT = JSON.parse(d)
			return deck
		})
		.sort((a, b) => a.name.localeCompare(b.name))
	const deckList: ReactNode = sortedDecks.map(
		(deck: PlayerDeckT, i: number) => {
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
		}
	)
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
		attachableEffects: loadedDeck.cards.filter(
			(card) => CARDS[card.cardId]?.type === 'effect'
		),
		singleUseEffects: loadedDeck.cards.filter(
			(card) => CARDS[card.cardId]?.type === 'single_use'
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

	// TODO: Convert to component
	const SelectDeck = () => {
		return (
			<>
				<ImportModal
					setOpen={showImportModal}
					onClose={() => setShowImportModal(!showImportModal)}
					importDeck={(deck) => handleImportDeck(deck)}
				/>
				<ExportModal
					setOpen={showExportModal}
					onClose={() => setShowExportModal(!showExportModal)}
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
					action={() => deleteDeckInternal()}
					title="Delete Deck"
					description={`Are you sure you wish to delete the "${loadedDeck.name}" deck?`}
					actionText="Delete"
				/>
				<AlertModal
					setOpen={showDuplicateDeckModal}
					onClose={() => setShowDuplicateDeckModal(!showDuplicateDeckModal)}
					action={() => duplicateDeck(loadedDeck)}
					title="Duplicate Deck"
					description={
						canDuplicateDeck()
							? `Are you sure you want to duplicate the "${loadedDeck.name}" deck?`
							: `You have too many duplicates of the "${loadedDeck.name}" deck.`
					}
					actionText={canDuplicateDeck() ? 'Duplicate' : undefined}
					actionType="primary"
				/>
				<AlertModal
					setOpen={showOverwriteModal}
					onClose={() => setShowOverwriteModal(!showOverwriteModal)}
					action={() => saveDeckInternal(importedDeck)}
					title="Overwrite Deck"
					description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
					actionText="Overwrite"
				/>

				<DeckLayout
					title="Deck Selection"
					back={backToMenu}
					returnText="Back To Menu"
				>
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
									<div className={css.deckName}>
										<span>{loadedDeck.name}</span>
									</div>
									<div className={css.dynamicSpace}></div>

									<p className={classNames(css.cardCount)}>
										{loadedDeck.cards.length}/{CONFIG.limits.maxCards}{' '}
										<span className={css.hideOnMobile}>cards</span>
									</p>
									<div className={css.cardCount}>
										<p className={css.tokens}>
											{getTotalCost(
												loadedDeck.cards.map((card) => card.cardId)
											)}
											/{CONFIG.limits.maxDeckCost}{' '}
											<span className={css.hideOnMobile}>tokens</span>
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
								<span>
									Edit<span className={css.hideOnMobile}> Deck</span>
								</span>
							</Button>
							<Button
								variant="default"
								size="small"
								onClick={() => setShowExportModal(!showExportModal)}
								leftSlot={<ExportIcon />}
							>
								<span>
									Export<span className={css.hideOnMobile}> Deck</span>
								</span>
							</Button>
							<Button
								variant="primary"
								size="small"
								onClick={() => setShowDuplicateDeckModal(true)}
								leftSlot={CopyIcon()}
							>
								<span>
									Duplicate<span className={css.hideOnMobile}> Deck</span>
								</span>
							</Button>
							{savedDecks.length > 1 && (
								<Button
									variant="error"
									size="small"
									leftSlot={<DeleteIcon />}
									onClick={() => setShowDeleteDeckModal(true)}
								>
									<span>
										Delete<span className={css.hideOnMobile}> Deck</span>
									</span>
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
							header={cardGroupHeader(
								'Attachable Effects',
								selectedCards.attachableEffects
							)}
						>
							<CardList
								cards={sortCards(selectedCards.attachableEffects)}
								size="small"
								wrap={true}
							/>
						</Accordion>
						<Accordion
							header={cardGroupHeader(
								'Single Use Effects',
								selectedCards.singleUseEffects
							)}
						>
							<CardList
								cards={sortCards(selectedCards.singleUseEffects)}
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
								<p style={{textAlign: 'center'}}>My Decks</p>
							</>
						}
						footer={
							<>
								<div className={css.sidebarFooter} style={{padding: '0.5rem'}}>
									{getLegacyDecks() && (
										<Button
											onClick={() => {
												const conversionCount = convertLegacyDecks()
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
											}}
										>
											Import Legacy Decks
										</Button>
									)}
									<Button variant="primary" onClick={() => setMode('create')}>
										Create New Deck
									</Button>
									<Button
										variant="primary"
										onClick={() => setShowImportModal(!showImportModal)}
									>
										<ExportIcon reversed />
										<span>Import Deck</span>
									</Button>
								</div>
							</>
						}
					>
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
						saveDeck={(returnedDeck) => saveDeckInternal(returnedDeck)}
						deck={loadedDeck}
					/>
				)
				break
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
				break
			default:
				return <SelectDeck />
		}
	}

	return router()
}

export default Deck
