import classNames from 'classnames'
import {ToastT} from 'common/types/app'
import {PlayerDeck, Tag} from 'common/types/deck'
import {getDeckCost} from 'common/utils/ranks'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import AlertModal from 'components/alert-modal'
import Button from 'components/button'
import CardList from 'components/card-list'
import MobileCardList from 'components/card-list/mobile-card-list'
import Dropdown from 'components/dropdown'
import {ExportModal, ImportModal} from 'components/import-export'
import {MassExportModal} from 'components/import-export/mass-export-modal'
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ErrorIcon,
	ExportIcon,
} from 'components/svgs'
import {TagsModal} from 'components/tags-modal'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	setActiveDeck,
	toPlayerDeck,
	toSavedDeck,
} from 'logic/saved-decks/saved-decks'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {ReactNode, useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import {sortCards} from './deck-edit'
import css from './deck.module.scss'
import DeckLayout from './layout'
import {Deck} from 'common/types/database'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {DatabaseInfo} from 'logic/game/database/database-reducer'

type Props = {
	setMenuSection: (section: string) => void
	setLoadedDeck: (deck: Deck) => void
	setMode: (mode: 'select' | 'edit' | 'create') => void
	loadedDeck: Deck
	databaseInfo: DatabaseInfo
	forceUpdate: () => void
}

function SelectDeck({
	setLoadedDeck,
	setMenuSection,
	setMode,
	loadedDeck,
	databaseInfo,
	forceUpdate,
}: Props) {
	// REDUX
	const dispatch = useMessageDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const settings = useSelector(getSettings)

	const saveDeck = (deck: Deck) => {
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: deck,
		})
		setSavedDecks(databaseInfo.decks)
		setSortedDecks(sortDecks([...savedDecks, deck]))
		setFilteredDecks(sortDecks([...savedDecks, deck]))
	}

	console.log(databaseInfo.decks)

	// STATE
	const [oldDatabaseInfo, setOldDatabaseInfo] =
		useState<DatabaseInfo>(databaseInfo)
	const [savedDecks, setSavedDecks] = useState<Array<Deck>>(databaseInfo.decks)

	function sortDecks(decks: Deck[]): Array<Deck> {
		return decks.sort((a, b) => {
			if (settings.deckSortingMethod === 'Alphabetical') {
				return a.name.localeCompare(b.name)
			}
			if (settings.deckSortingMethod === 'First Tag') {
				const aHasTags = a.tags && a.tags.length > 0
				const bHasTags = b.tags && b.tags.length > 0
				if (!aHasTags && !bHasTags) return a.name.localeCompare(b.name)
				if (!aHasTags && bHasTags) return 1
				if (aHasTags && !bHasTags) return 0
				const aFirstTag = a.tags![0].name
				const bFirstTag = b.tags![0].name
				return aFirstTag.localeCompare(bFirstTag)
			}
			//Default case so something is always returned
			return 0
		})
	}

	function filterDecks(decks: Array<Deck>): Array<Deck> {
		if (!settings.lastSelectedTag) return decks
		return decks.filter((deck) =>
			deck.tags?.find((tag) => tag.key === settings.lastSelectedTag),
		)
	}
	const [sortedDecks, setSortedDecks] = useState<Array<Deck>>(
		sortDecks(savedDecks),
	)

	const [filteredDecks, setFilteredDecks] = useState<Array<Deck>>(
		filterDecks(sortedDecks),
	)

	if (oldDatabaseInfo.decks.length !== databaseInfo.decks.length) {
		setOldDatabaseInfo(databaseInfo)
		setSavedDecks(databaseInfo.decks)
		setFilteredDecks(sortDecks(databaseInfo.decks))
	}

	const savedDeckNames = savedDecks.map((deck) => deck.name)
	const [importedDeck, setImportedDeck] = useState<PlayerDeck>({
		name: 'undefined',
		icon: 'any',
		cards: [],
		code: generateDatabaseCode(),
		tags: [],
	})
	const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<boolean>(false)
	const [showDuplicateDeckModal, setShowDuplicateDeckModal] =
		useState<boolean>(false)
	const [showImportModal, setShowImportModal] = useState<boolean>(false)
	const [showExportModal, setShowExportModal] = useState<boolean>(false)
	const [showMassExportModal, setShowMassExportModal] = useState<boolean>(false)
	const [showManageTagsModal, setShowManageTagsModal] = useState<boolean>(false)
	const [showValidateDeckModal, setShowValidateDeckModal] =
		useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [tagFilter, setTagFilter] = useState<Tag>(() => {
		const lastSelectedTag = databaseInfo.tags.find(
			(tag) => tag.key === settings.lastSelectedTag,
		)
		if (lastSelectedTag) return lastSelectedTag
		return {
			name: 'No Filter',
			color: '#ffffff',
			key: '0',
		}
	})

	const tagsDropdownOptions = [
		{name: 'No Filter', color: '#ffffff'},
		...databaseInfo.tags,
	].map((option) => ({
		name: option.name,
		key: JSON.stringify(option),
		color: option.color,
	}))

	// TOASTS
	const dispatchToast = (toast: ToastT) =>
		dispatch({type: localMessages.TOAST_OPEN, ...toast})
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
		dispatchToast(selectedDeckToast)

		dispatch({
			type: localMessages.UPDATE_DECKS_THEN_SELECT,
			code: loadedDeck.code,
		})
		setMenuSection('mainmenu')
	}
	const handleInvalidDeck = () => {
		saveDeck(toSavedDeck(playerDeck))
		setMenuSection('mainmenu')
		dispatchToast(lastValidDeckToast)
	}
	const handleImportDeck = (deck: PlayerDeck) => {
		setImportedDeck(deck)
		importDeck(deck)
		setShowImportModal(false)
	}
	const handleMassImportDecks = () => {
		// setSavedDecks(getSavedDecks())
		setShowImportModal(false)
	}

	//DECK LOGIC
	const loadDeck = (deck: Deck) => {
		setLoadedDeck(deck)
	}
	const importDeck = (deck: PlayerDeck) => {
		let deckExists = false
		savedDeckNames.map((name) => {
			if (name === deck.name) {
				console.log(`Name: ${name} | Import: ${deck.name}`)
				deckExists = true
			}
		})
		if (deckExists) {
			setShowOverwriteModal(true)
			return
		}

		saveDeck(toSavedDeck(deck))
	}
	const deleteDeck = (deletedDeck: Deck) => {
		const deckToDelete = databaseInfo.decks.find(
			(deck) => deck.code === deletedDeck.code,
		)
		if (!deckToDelete) return
		dispatch({
			type: localMessages.DELETE_DECK,
			deck: deckToDelete,
		})

		const newSavedDecks = savedDecks.filter(
			(deck) => deck.code !== deckToDelete.code,
		)

		setSavedDecks(newSavedDecks)
		setSortedDecks(sortDecks(newSavedDecks))
		setFilteredDecks(sortDecks(newSavedDecks))
		dispatch({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'decks',
				value: newSavedDecks,
			},
		})
		dispatchToast(deleteToast)
		setActiveDeck(newSavedDecks[0])
	}
	const canDuplicateDeck = () => {
		return (
			databaseInfo.decks.findIndex(
				(deck) => deck.name === `${loadedDeck.name} Copy 9`,
			) > -1
		)
	}
	const duplicateDeck = (deck: PlayerDeck) => {
		//Save duplicated deck to Local Storage
		let newName = `${deck.name} Copy`
		let number = 2

		while (
			databaseInfo.decks.findIndex((deck) => deck.name === 'newName') > -1
		) {
			if (number > 9) return
			newName = `${deck.name} Copy ${number}`
			number++
		}

		const newDeck = toSavedDeck({...deck, name: newName})

		saveDeck(newDeck)

		//Refresh saved deck list and load new deck
		setSavedDecks(savedDecks)
		setSortedDecks(sortDecks([...savedDecks, newDeck]))
		setFilteredDecks(sortDecks([...savedDecks, newDeck]))
	}

	const selectedDeckRef = useRef<HTMLLIElement>(null)

	useEffect(() => {
		selectedDeckRef.current?.scrollIntoView({
			behavior: 'instant',
			block: 'nearest',
		})
	})

	const deckList: ReactNode = filteredDecks.map((deck: Deck, i: number) => {
		return (
			<li
				className={classNames(
					css.myDecksItem,
					loadedDeck.code === deck.code && css.selectedDeck,
				)}
				ref={loadedDeck.code === deck.code ? selectedDeckRef : undefined}
				key={i}
				onClick={() => {
					playSwitchDeckSFX()
					loadDeck(deck)
				}}
			>
				{deck.tags && deck.tags.length > 0 ? (
					<div className={css.multiColoredCircle}>
						{deck.tags.map((tag, i) => (
							<div
								className={css.singleTag}
								style={{backgroundColor: tag.color}}
								key={i}
							></div>
						))}
					</div>
				) : (
					<div className={css.multiColoredCircle}>
						<div className={css.singleTag}></div>
					</div>
				)}
				<div
					className={classNames(css.deckImage, css.usesIcon, css[deck.icon])}
				>
					<img
						src={'../images/types/type-' + deck.icon + '.png'}
						alt={'deck-icon'}
					/>
				</div>
				{deck.name}
			</li>
		)
	})
	const footerTags = (
		<div className={css.footerTags}>
			<Dropdown
				button={
					<button className={css.dropdownButton}>
						{' '}
						<img src="../images/icons/tag.png" alt="tag-icon" />
					</button>
				}
				label="Saved Tags"
				options={tagsDropdownOptions}
				action={(option) => {
					if (option.includes('No Filter')) {
						setFilteredDecks(sortedDecks)
						setTagFilter({
							name: 'No Filter',
							color: '#ffffff',
							key: '0',
						})
						dispatch({
							type: localMessages.SETTINGS_SET,
							setting: {
								key: 'lastSelectedTag',
								value: null,
							},
						})
						return
					}
					const parsedOption = JSON.parse(option) as Tag
					console.log(parsedOption)
					setFilteredDecks(
						sortedDecks.filter((deck) =>
							deck.tags.some(
								(tag) =>
									tag.name === parsedOption.name &&
									tag.color === parsedOption.color,
							),
						),
					)
					setTagFilter(parsedOption)
					dispatch({
						type: localMessages.SETTINGS_SET,
						setting: {
							key: 'lastSelectedTag',
							value: parsedOption.key,
						},
					})
				}}
			/>
			<div
				className={css.tagBox}
				style={{backgroundColor: tagFilter.color}}
			></div>
			{tagFilter.name}
		</div>
	)

	const currentDeck = toPlayerDeck(loadedDeck)
	const validationResult = validateDeck(currentDeck.cards)

	const selectedCards = {
		hermits: currentDeck.cards.filter(
			(card) => card.props.category === 'hermit',
		),
		items: currentDeck.cards.filter((card) => card.props.category === 'item'),
		attachableEffects: currentDeck.cards.filter(
			(card) => card.props.category === 'attach',
		),
		singleUseEffects: currentDeck.cards.filter(
			(card) => card.props.category === 'single_use',
		),
	}

	//MISC
	const playSwitchDeckSFX = () => {
		const pageTurn = [
			'/sfx/Page_turn1.ogg',
			'/sfx/Page_turn2.ogg',
			'/sfx/Page_turn3.ogg',
		]
		dispatch({
			type: localMessages.SOUND_PLAY,
			path: pageTurn[Math.floor(Math.random() * pageTurn.length)],
		})
	}

	return (
		<>
			<ImportModal
				setOpen={showImportModal}
				onClose={() => setShowImportModal(!showImportModal)}
				importDeck={(deck) => handleImportDeck(deck)}
				handleMassImport={handleMassImportDecks}
				forceUpdate={forceUpdate}
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
			<TagsModal
				setOpen={showManageTagsModal}
				onClose={() => setShowManageTagsModal(!showManageTagsModal)}
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
				action={() => deleteDeck(loadedDeck)}
				title="Delete Deck"
				description={`Are you sure you wish to delete the "${loadedDeck.name}" deck?`}
				actionText="Delete"
			/>
			<AlertModal
				setOpen={showDuplicateDeckModal}
				onClose={() => setShowDuplicateDeckModal(!showDuplicateDeckModal)}
				action={() => {
					duplicateDeck(currentDeck)
				}}
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
				action={() => saveDeck(toSavedDeck(importedDeck))}
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
								<div
									className={classNames(
										css.deckImage,
										css.usesIcon,
										css[loadedDeck.icon],
									)}
								>
									<img
										src={
											'../images/types/type-' +
											(!loadedDeck.icon ? 'any' : loadedDeck.icon) +
											'.png'
										}
										alt="deck-icon"
									/>
								</div>
								<div className={css.deckName}>{loadedDeck.name}</div>
								{loadedDeck.tags &&
									loadedDeck.tags.map((tag) => {
										return (
											<div className={css.fullTagTitle}>
												<span
													className={css.fullTagColor}
													style={{backgroundColor: tag.color}}
												></span>
												{tag.name}
											</div>
										)
									})}
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
					mobileChildren={
						<div className={css.mobileSelector}>
							<div className={css.mobileDeckName}>
								{loadedDeck.tags && loadedDeck.tags.length > 0 && (
									<div className={css.multiColoredCircleBorder}>
										<div className={css.multiColoredCircle}>
											{loadedDeck.tags.map((tag) => (
												<div
													className={css.singleTag}
													style={{backgroundColor: tag.color}}
												></div>
											))}
										</div>
									</div>
								)}
								<div
									className={classNames(
										css.deckImage,
										css.usesIcon,
										css[loadedDeck.icon],
									)}
								>
									<img
										src={
											'../images/types/type-' +
											(!loadedDeck.icon ? 'any' : loadedDeck.icon) +
											'.png'
										}
										alt="deck-icon"
									/>
								</div>
								<span
									className={classNames(
										css.mobileDeckNameText,
										!validationResult.valid && css.invalid,
									)}
								>
									{loadedDeck.name}
									{!validationResult.valid && validationResult.reason && (
										<span className={css.mobileErrorIcon}>
											<ErrorIcon />
										</span>
									)}
								</span>
								<span className={css.mobileDeckNamePadding}></span>
								<div className={css.mobileDeckStats}>
									<div className={css.mobileDeckStat}>
										{loadedDeck.cards.length}/{CONFIG.limits.maxCards}
									</div>
									<div className={classNames(css.mobileDeckStat, css.tokens)}>
										{getDeckCost(loadedDeck.cards)}/{CONFIG.limits.maxDeckCost}
									</div>
								</div>
							</div>
							<div className={css.deckListBox}>
								<div className={css.mobileDeckPreview}>
									<MobileCardList
										cards={sortCards(currentDeck.cards)}
										small={true}
									/>
								</div>
								<div className={css.deckListContainer}>
									<div className={css.deckList}>{deckList}</div>
								</div>
							</div>
							<div className={css.mobileTags}>
								{footerTags}
								<Button
									variant="default"
									onClick={() => setShowManageTagsModal(!showManageTagsModal)}
									size="small"
								>
									<span>Manage Tags</span>
								</Button>
							</div>
							<div className={css.filterGroup}>
								<Button
									variant="default"
									size="small"
									onClick={() => setMode('edit')}
									leftSlot={<EditIcon />}
								>
									<span>Edit</span>
								</Button>
								<Button
									variant="primary"
									size="small"
									onClick={() => setShowDuplicateDeckModal(true)}
									leftSlot={CopyIcon()}
								>
									<span>Copy</span>
								</Button>
								{savedDecks.length > 1 && (
									<Button
										variant="error"
										size="small"
										leftSlot={<DeleteIcon />}
										onClick={() => setShowDeleteDeckModal(true)}
									>
										<span>Delete</span>
									</Button>
								)}
								<Button
									variant="primary"
									size="small"
									onClick={() => setMode('create')}
								>
									New Deck
								</Button>
								<Button
									variant="primary"
									size="small"
									onClick={() => setShowImportModal(!showImportModal)}
								>
									<ExportIcon reversed />
									Import
								</Button>
								<Button
									variant="default"
									size="small"
									onClick={() => setShowExportModal(!showExportModal)}
									leftSlot={<ExportIcon />}
								>
									<span>Export</span>
								</Button>
								<Button
									variant="default"
									size="small"
									onClick={() => setShowMassExportModal(!showMassExportModal)}
								>
									<ExportIcon />
									<span>Mass Export</span>
								</Button>
							</div>
						</div>
					}
				>
					<div className={css.filterGroup}>
						<Button
							variant="default"
							size="small"
							onClick={() => setMode('edit')}
							leftSlot={<EditIcon />}
						>
							<span>Edit Deck</span>
						</Button>
						<Button
							variant="default"
							size="small"
							onClick={() => setShowExportModal(!showExportModal)}
							leftSlot={<ExportIcon />}
						>
							<span>Export Deck</span>
						</Button>
						<Button
							variant="primary"
							size="small"
							onClick={() => setShowDuplicateDeckModal(true)}
							leftSlot={CopyIcon()}
						>
							<span>Copy Deck</span>
						</Button>
						{savedDecks.length > 1 && (
							<Button
								variant="error"
								size="small"
								leftSlot={<DeleteIcon />}
								onClick={() => setShowDeleteDeckModal(true)}
							>
								<span>Delete Deck</span>
							</Button>
						)}
					</div>
					{!validationResult.valid && (
						<div className={css.validationMessage}>
							<span style={{paddingRight: '0.5rem'}}>{<ErrorIcon />}</span>{' '}
							{validationResult.reason}
						</div>
					)}

					<Accordion header={cardGroupHeader('Hermits', selectedCards.hermits)}>
						<CardList
							cards={sortCards(selectedCards.hermits)}
							displayTokenCost={true}
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
							displayTokenCost={true}
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
							displayTokenCost={true}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>

					<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
						<CardList
							cards={sortCards(selectedCards.items)}
							displayTokenCost={true}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>
				</DeckLayout.Main>
				<DeckLayout.Sidebar
					showHeader={true}
					showHeaderOnMobile={false}
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
								{footerTags}
								<Button variant="primary" onClick={() => setMode('create')}>
									Create New Deck
								</Button>
								<div className={css.importAndExport}>
									<Button
										variant="primary"
										onClick={() => setShowImportModal(!showImportModal)}
										style={{flexGrow: 1}}
									>
										<ExportIcon reversed />
										<span>Import</span>
									</Button>
									<Button
										variant="default"
										onClick={() => setShowMassExportModal(!showMassExportModal)}
									>
										<ExportIcon />
										<span>Mass Export</span>
									</Button>
								</div>
								<Button
									variant="default"
									onClick={() => setShowManageTagsModal(!showManageTagsModal)}
								>
									<span>Manage Tags</span>
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
