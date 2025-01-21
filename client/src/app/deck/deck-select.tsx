import classNames from 'classnames'
import {ToastT} from 'common/types/app'
import {Deck, Tag} from 'common/types/deck'
import {sortCardInstances} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {getDeckCost} from 'common/utils/ranks'
import {getIconPath} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import Button from 'components/button'
import CardList from 'components/card-list'
import MobileCardList from 'components/card-list/mobile-card-list'
import Dropdown from 'components/dropdown'
import {
	ExportModal,
	ImportModal,
	ScreenshotDeckModal,
} from 'components/import-export'
import {MassExportModal} from 'components/import-export/mass-export-modal'
import {ConfirmModal} from 'components/modal'
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ErrorIcon,
	ExportIcon,
	ViewFullDeckIcon,
} from 'components/svgs'
import {TagsModal} from 'components/tags-modal'
import {DatabaseInfo} from 'logic/game/database/database-reducer'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'
import {ReactNode, useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import css from './deck.module.scss'
import DeckLayout from './layout'

type Props = {
	setMenuSection: (section: string) => void
	setLoadedDeck: (deck: Deck) => void
	setMode: (mode: 'select' | 'edit' | 'create') => void
	loadedDeck: Deck
	databaseInfo: DatabaseInfo
	filteredDecks: Array<Deck>
	setFilteredDecks: (decks: Array<Deck>) => void
}

function SelectDeck({
	setLoadedDeck,
	setMenuSection,
	setMode,
	loadedDeck,
	databaseInfo,
	filteredDecks,
	setFilteredDecks,
}: Props) {
	// REDUX
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)

	const saveDeck = (deck: Deck) => {
		dispatch({
			type: localMessages.INSERT_DECK,
			deck: deck,
		})
		databaseInfo.decks.push(deck)

		const newTags = deck.tags.reduce((r: Array<Tag>, tag) => {
			if (databaseInfo.tags.find((subtag) => subtag.key === tag.key)) return r
			return [...r, tag]
		}, [])

		databaseInfo.tags.push(...newTags)
		setFilteredDecks(sortDecks(databaseInfo.decks))
		setLoadedDeck(deck)
	}

	// STATE
	const [oldDatabaseInfo, setOldDatabaseInfo] = useState<DatabaseInfo>(() => {
		setFilteredDecks(filterDecks(sortDecks(databaseInfo.decks)))
		return databaseInfo
	})

	function sortDecks(decks: Array<Deck>): Array<Deck> {
		return decks.sort((a, b) => {
			if (settings.deckSortingMethod === 'Alphabetical') {
				if (a.name === b.name) {
					return a.code.localeCompare(b.code)
				}
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

	if (oldDatabaseInfo !== databaseInfo) {
		setOldDatabaseInfo(databaseInfo)
		setFilteredDecks(filterDecks(sortDecks(databaseInfo.decks)))
	}

	const [importedDeck, setImportedDeck] = useState<Deck>({
		name: 'undefined',
		iconType: 'item',
		icon: 'any',
		cards: [],
		code: generateDatabaseCode(),
		tags: [],
		public: false,
	})
	const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<boolean>(false)
	const [showDuplicateDeckModal, setShowDuplicateDeckModal] =
		useState<boolean>(false)
	const [showImportModal, setShowImportModal] = useState<boolean>(false)
	const [showExportModal, setShowExportModal] = useState<boolean>(false)
	const [showMassExportModal, setShowMassExportModal] = useState<boolean>(false)
	const [showManageTagsModal, setShowManageTagsModal] = useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [showScreenshotModal, setShowScreenshotModal] = useState<boolean>(false)

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
		image: getIconPath(loadedDeck),
	}
	const selectedDeckToast: ToastT = {
		open: true,
		title: 'Deck Selected!',
		description: `${loadedDeck.name} is now your active deck`,
		image: getIconPath(loadedDeck),
	}

	// MENU LOGIC
	const backToMenu = () => {
		dispatchToast(selectedDeckToast)

		dispatch({
			type: localMessages.UPDATE_DECKS,
			newActiveDeck: loadedDeck,
		})
		setMenuSection('mainmenu')
	}
	const handleImportDeck = (deck: Deck) => {
		setImportedDeck(deck)
		saveDeck(deck)
		setShowImportModal(false)
	}
	const handleMassImportDecks = () => {
		setShowImportModal(false)
	}

	//DECK LOGIC
	const loadDeck = (deck: Deck) => {
		setLoadedDeck(deck)
	}
	const deleteDeck = (deletedDeck: Deck) => {
		const deckToDelete = databaseInfo.decks.find(
			(deck) => deck.code === deletedDeck.code,
		)
		if (!deckToDelete || databaseInfo.decks.length <= 1) return
		dispatch({
			type: localMessages.DELETE_DECK,
			deck: deckToDelete,
		})

		const newSavedDecks = databaseInfo.decks.filter(
			(deck) => deck.code !== deckToDelete.code,
		)

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
		setLoadedDeck(newSavedDecks[0])
		setShowDeleteDeckModal(false)
	}
	const duplicateDeck = (deck: Deck) => {
		const newDeck = {
			...deck,
			name: `${deck.name} Copy`,
			code: generateDatabaseCode(),
		}

		saveDeck(newDeck)
		setShowDuplicateDeckModal(false)
	}

	const selectedDeckRef = useRef<HTMLLIElement>(null)

	useEffect(() => {
		selectedDeckRef.current?.scrollIntoView({
			behavior: 'instant',
			block: 'nearest',
		})
	})

	const decksHaveTags =
		filteredDecks.reduce((tags: Array<Tag>, decks) => {
			return [...tags, ...decks.tags]
		}, []).length > 0

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
				{deck.tags && deck.tags.length > 0 && (
					<div className={css.multiColoredCircle}>
						{deck.tags.map((tag, i) => (
							<div
								className={css.singleTag}
								style={{backgroundColor: tag.color}}
								key={i}
							></div>
						))}
					</div>
				)}
				{decksHaveTags && deck.tags.length === 0 && (
					<div className={css.multiColoredCircle}>
						<div className={css.singleTag}></div>
					</div>
				)}
				<div
					className={classNames(css.deckImage, css.usesIcon, css[deck.icon])}
				>
					<img src={getIconPath(deck)} alt={'deck-icon'} />
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
				showNames={true}
				direction={'up'}
				action={(option) => {
					if (option.includes('No Filter')) {
						setFilteredDecks(sortDecks(databaseInfo.decks))
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
					setFilteredDecks(
						sortDecks(
							databaseInfo.decks.filter((deck) =>
								deck.tags.some(
									(tag) =>
										tag.name === parsedOption.name &&
										tag.color === parsedOption.color,
								),
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

	const currentDeck = loadedDeck
	const validationResult = validateDeck(
		currentDeck.cards.map((card) => card.props),
	)

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
				onClose={() => setShowImportModal(false)}
				importDeck={(deck) => handleImportDeck(deck)}
				handleMassImport={handleMassImportDecks}
			/>
			<ExportModal
				setOpen={showExportModal}
				onClose={() => setShowExportModal(false)}
				loadedDeck={loadedDeck}
			/>
			<MassExportModal
				setOpen={showMassExportModal}
				onClose={() => setShowMassExportModal(false)}
			/>
			<ScreenshotDeckModal
				setOpen={showScreenshotModal}
				cards={sortCardInstances(loadedDeck.cards).map((card) => card.props)}
				onClose={() => setShowScreenshotModal(false)}
			/>
			<TagsModal
				setOpen={showManageTagsModal}
				onClose={() => setShowManageTagsModal(false)}
			/>
			<ConfirmModal // Delete Deck Modal
				setOpen={showDeleteDeckModal}
				title="Delete Deck"
				description={`Are you sure you want to delete the "${loadedDeck.name}" deck?`}
				confirmButtonText="Delete Deck"
				onCancel={() => setShowDeleteDeckModal(false)}
				onConfirm={() => deleteDeck(loadedDeck)}
			/>
			<ConfirmModal // Duplicate Deck Modal
				setOpen={showDuplicateDeckModal}
				title="Duplicate Deck"
				description={`Are you sure you want to duplicate the "${loadedDeck.name}" deck?`}
				confirmButtonText="Duplicate"
				confirmButtonVariant="primary"
				onCancel={() => setShowDuplicateDeckModal(false)}
				onConfirm={() => duplicateDeck(currentDeck)}
			/>
			<ConfirmModal // Overwrite Deck Modal
				setOpen={showOverwriteModal}
				title="Overwrite Deck"
				description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
				confirmButtonText="Overwrite"
				onCancel={() => setShowOverwriteModal(false)}
				onConfirm={() => saveDeck(importedDeck)}
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
									<img src={getIconPath(loadedDeck)} alt="deck-icon" />
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
										{getDeckCost(loadedDeck.cards.map((card) => card.props))}/
										{CONFIG.limits.maxDeckCost}{' '}
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
									<img src={getIconPath(loadedDeck)} alt="deck-icon" />
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
								<button
									className={css.dropdownButton}
									onClick={() => setShowScreenshotModal(true)}
								>
									<img src="/images/toolbar/shulker.png" />
								</button>
								<div className={css.mobileDeckStats}>
									<div className={css.mobileDeckStat}>
										{loadedDeck.cards.length}/{CONFIG.limits.maxCards}
									</div>
									<div className={classNames(css.mobileDeckStat, css.tokens)}>
										{getDeckCost(loadedDeck.cards.map((card) => card.props))}/
										{CONFIG.limits.maxDeckCost}
									</div>
								</div>
							</div>
							<div className={css.deckListBox}>
								<div className={css.mobileDeckPreview}>
									<MobileCardList
										cards={sortCardInstances(currentDeck.cards)}
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
									disabled={databaseInfo.noConnection}
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
								{databaseInfo.decks.length > 1 && (
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
									disabled={databaseInfo.noConnection}
								>
									<ExportIcon reversed />
									Import
								</Button>
								<Button
									variant="default"
									size="small"
									onClick={() => setShowExportModal(!showExportModal)}
									leftSlot={<ExportIcon />}
									disabled={databaseInfo.noConnection}
								>
									<span>Export</span>
								</Button>
								<Button
									variant="default"
									size="small"
									onClick={() => setShowMassExportModal(!showMassExportModal)}
									disabled={databaseInfo.noConnection}
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
							disabled={databaseInfo.noConnection}
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
						{databaseInfo.decks.length > 1 && (
							<Button
								variant="error"
								size="small"
								leftSlot={<DeleteIcon />}
								onClick={() => setShowDeleteDeckModal(true)}
							>
								<span>Delete Deck</span>
							</Button>
						)}
						<Button
							variant="default"
							size="small"
							onClick={() => setShowScreenshotModal(true)}
						>
							<ViewFullDeckIcon />
							<span>View Full Deck</span>
						</Button>
					</div>
					{!validationResult.valid && (
						<div className={css.validationMessage}>
							<span style={{paddingRight: '0.5rem'}}>{<ErrorIcon />}</span>{' '}
							{validationResult.reason}
						</div>
					)}

					<Accordion header={cardGroupHeader('Hermits', selectedCards.hermits)}>
						<CardList
							cards={sortCardInstances(selectedCards.hermits)}
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
							cards={sortCardInstances(selectedCards.attachableEffects)}
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
							cards={sortCardInstances(selectedCards.singleUseEffects)}
							displayTokenCost={true}
							wrap={true}
							disableAnimations={true}
						/>
					</Accordion>

					<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
						<CardList
							cards={sortCardInstances(selectedCards.items)}
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
										disabled={databaseInfo.noConnection}
									>
										<ExportIcon reversed />
										<span>Import</span>
									</Button>
									<Button
										variant="default"
										onClick={() => setShowMassExportModal(!showMassExportModal)}
										disabled={databaseInfo.noConnection}
									>
										<ExportIcon />
										<span>Mass Export</span>
									</Button>
								</div>
								<Button
									variant="default"
									onClick={() => setShowManageTagsModal(!showManageTagsModal)}
									disabled={databaseInfo.noConnection}
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
