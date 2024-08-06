import classNames from 'classnames'
import {ToastT} from 'common/types/app'
import {PlayerDeckT} from 'common/types/deck'
import {getDeckCost} from 'common/utils/ranks'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import AlertModal from 'components/alert-modal'
import Button from 'components/button'
import CardList from 'components/card-list'
import {ExportModal, ImportModal} from 'components/import-export'
import {MassExportModal} from 'components/import-export/mass-export-modal'
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ErrorIcon,
	ExportIcon,
} from 'components/svgs'
import {actions, useActionDispatch} from 'logic/actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {
	convertLegacyDecks,
	deleteDeck,
	getLegacyDecks,
	getSavedDeck,
	getSavedDecks,
	saveDeck,
	setActiveDeck,
} from 'logic/saved-decks/saved-decks'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {ReactNode, useState} from 'react'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import {sortCards} from './deck-edit'
import css from './deck.module.scss'
import DeckLayout from './layout'

type Props = {
	setMenuSection: (section: string) => void
	setLoadedDeck: (deck: PlayerDeckT) => void
	setMode: (mode: 'select' | 'edit' | 'create') => void
	loadedDeck: PlayerDeckT
}

function SelectDeck({
	setLoadedDeck,
	setMenuSection,
	setMode,
	loadedDeck,
}: Props) {
	// REDUX
	const dispatch = useActionDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const settings = useSelector(getSettings)

	// STATE
	const [savedDecks, setSavedDecks] = useState<Array<string>>(getSavedDecks)

	const savedDeckNames = savedDecks.map((deck) =>
		deck ? getSavedDeck(deck)?.name : null,
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
	const [showMassExportModal, setShowMassExportModal] = useState<boolean>(false)
	const [showValidateDeckModal, setShowValidateDeckModal] =
		useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)

	// TOASTS
	const dispatchToast = (toast: ToastT) =>
		dispatch({type: actions.TOAST_OPEN, ...toast})
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
		if (validateDeck(loadedDeck.cards)) {
			return setShowValidateDeckModal(true)
		}

		setActiveDeck(loadedDeck.name)
		dispatchToast(selectedDeckToast)

		dispatch({type: actions.DECK_SET, deck: loadedDeck})
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
	const handleMassImportDecks = () => {
		setSavedDecks(getSavedDecks())
		setShowImportModal(false)
	}

	//DECK LOGIC
	const loadDeck = (deckName: string) => {
		if (!deckName)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)
		const deck = getSavedDeck(deckName)
		if (!deck)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)

		setLoadedDeck({
			...deck,
			cards: deck.cards,
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
		.map((d: any) => {
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
						loadedDeck.name === deck.name && css.selectedDeck,
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
		},
	)
	const validationMessage = validateDeck(loadedDeck.cards)
	const selectedCards = {
		hermits: loadedDeck.cards.filter(
			(card) => card.props.category === 'hermit',
		),
		items: loadedDeck.cards.filter((card) => card.props.category === 'item'),
		attachableEffects: loadedDeck.cards.filter(
			(card) => card.props.category === 'attach',
		),
		singleUseEffects: loadedDeck.cards.filter(
			(card) => card.props.category === 'single_use',
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
			dispatch({
				type: actions.SOUND_PLAY,
				path: pageTurn[Math.floor(Math.random() * pageTurn.length)],
			})
		}
	}

	return (
		<>
			<ImportModal
				setOpen={showImportModal}
				onClose={() => setShowImportModal(!showImportModal)}
				importDeck={(deck) => handleImportDeck(deck)}
				handleMassImport={handleMassImportDecks}
			/>
			<ExportModal
				setOpen={showExportModal}
				onClose={() => setShowExportModal(!showExportModal)}
				loadedDeck={loadedDeck}
			/>
			<MassExportModal
				setOpen={showMassExportModal}
				onClose={() => setShowMassExportModal(!showMassExportModal)}
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
										{getDeckCost(loadedDeck.cards)}/{CONFIG.limits.maxDeckCost}{' '}
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

					<Accordion header={cardGroupHeader('Hermits', selectedCards.hermits)}>
						<CardList
							cards={sortCards(selectedCards.hermits)}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>

					<Accordion
						header={cardGroupHeader(
							'Attachable Effects',
							selectedCards.attachableEffects,
						)}
					>
						<CardList
							cards={sortCards(selectedCards.attachableEffects)}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>
					<Accordion
						header={cardGroupHeader(
							'Single Use Effects',
							selectedCards.singleUseEffects,
						)}
					>
						<CardList
							cards={sortCards(selectedCards.singleUseEffects)}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>

					<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
						<CardList
							cards={sortCards(selectedCards.items)}
							wrap={true}
							disableAnimations={true}
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
														: 'No decks to convert!',
													image: '/images/card-icon.png',
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
									<span>Import Decks</span>
								</Button>
								<Button
									variant="default"
									onClick={() => setShowMassExportModal(!showMassExportModal)}
								>
									<ExportIcon />
									<span>Mass Export</span>
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

export default SelectDeck
