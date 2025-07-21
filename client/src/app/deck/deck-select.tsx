import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {getIconPath} from 'common/game/setup-game'
import {ToastT} from 'common/types/app'
import {Deck, Tag} from 'common/types/deck'
import {sortCardInstances} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {getDeckTypes, sortDecks} from 'common/utils/decks'
import {getDeckCost} from 'common/utils/ranks'
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
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {setActiveDeck} from 'logic/saved-decks/saved-decks'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import {iconDropdownOptions} from './deck-edit'
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

type FilterProps = {
	tagFilter: Tag | null
	tagFilterAction: (s: string) => void
	typeFilter: string
	typeFilterAction: (s: string) => void
	nameFilterAction: (s: string) => void
	dropdownDirection: 'up' | 'down'
}

export function FilterComponent({
	tagFilterAction,
	tagFilter,
	typeFilter,
	typeFilterAction,
	nameFilterAction,
	dropdownDirection,
}: FilterProps) {
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const tags = databaseInfo.tags

	const tagsDropdownOptions = [{name: 'No Tag', color: '#ffffff'}, ...tags].map(
		(option) => ({
			name: option.name,
			key: JSON.stringify(option),
			color: option.color,
		}),
	)

	return (
		<div className={css.footerTags}>
			<Dropdown
				button={
					<button className={css.dropdownButton}>
						<img
							src={`/images/types/type-${typeFilter === '' ? 'any' : typeFilter}.png`}
						/>
					</button>
				}
				label="Type Filter"
				options={iconDropdownOptions}
				showNames={true}
				direction={dropdownDirection}
				action={typeFilterAction}
			/>
			<Dropdown
				button={
					<button className={css.dropdownButton}>
						<img src="../images/icons/tag.png" alt="tag-icon" />
					</button>
				}
				label="Tag Filter"
				options={tagsDropdownOptions}
				showNames={true}
				direction={dropdownDirection}
				action={tagFilterAction}
			/>
			<div
				className={css.tagBox}
				style={{backgroundColor: tagFilter?.color || '#FFFFFF'}}
			></div>
			<div className={css.deckTagName}>{tagFilter?.name || 'No Tag'}</div>
			<input
				className={css.deckSearchInput}
				placeholder={'Search...'}
				onChange={(e) => {
					nameFilterAction(e.target.value)
				}}
				onKeyDown={(e) => {
					if (e.key !== 'Escape') return
					e.stopPropagation()
					e.currentTarget.blur()
				}}
			></input>
		</div>
	)
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
		setFilteredDecks(sortDecks(databaseInfo.decks, settings.deckSortingMethod))
		setLoadedDeck(deck)
	}

	// STATE
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
			name: 'No Tag',
			color: '#ffffff',
			key: '0',
		}
	})
	const [typeFilter, setTypeFilter] = useState<string>('')
	const [nameFilter, setNameFilter] = useState<string>('')

	function filterDecks(
		decks: Array<Deck>,
		d?: {tag?: string | null; type?: string; name?: string},
	): Array<Deck> {
		const compareTag =
			d && d.tag === null ? null : (d && d.tag) || settings.lastSelectedTag
		const compareType = (d && d.type) || typeFilter
		const compareName = d && d.name !== undefined ? d.name : nameFilter

		return decks.filter(
			(deck) =>
				(!compareTag || deck.tags?.find((tag) => tag.key === compareTag)) &&
				(!compareType ||
					compareType === 'any' ||
					getDeckTypes(deck.cards.map((card) => CARDS[card.id].id)).includes(
						compareType,
					)) &&
				(!compareName ||
					compareName === '' ||
					deck.name
						.toLocaleLowerCase()
						.includes(compareName.toLocaleLowerCase())),
		)
	}

	const [oldDatabaseInfo, setOldDatabaseInfo] = useState<DatabaseInfo>(() => {
		setFilteredDecks(
			filterDecks(sortDecks(databaseInfo.decks, settings.deckSortingMethod)),
		)
		return databaseInfo
	})

	if (oldDatabaseInfo !== databaseInfo) {
		setOldDatabaseInfo(databaseInfo)
		setFilteredDecks(
			filterDecks(sortDecks(databaseInfo.decks, settings.deckSortingMethod)),
		)
	}

	// TOASTS
	const dispatchToast = (toast: ToastT) =>
		dispatch({type: localMessages.TOAST_OPEN, ...toast})
	const deleteToast: ToastT = {
		open: true,
		title: 'Deck Deleted!',
		description: `Removed ${loadedDeck.name}`,
		image: getIconPath(loadedDeck),
	}

	// MENU LOGIC
	const backToMenu = () => {
		dispatch({
			type: localMessages.UPDATE_DECKS,
			newActiveDeck: loadedDeck,
		})
		setMenuSection('main-menu')
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

		setFilteredDecks(sortDecks(newSavedDecks, settings.deckSortingMethod))
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

	const deckList = filteredDecks.map((deck: Deck, i: number) => {
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
					<img src={getIconPath(deck)} />
				</div>
				{deck.name}
			</li>
		)
	})

	const currentDeck = loadedDeck
	const validationResult = validateDeck(
		currentDeck.cards.map((card) => CARDS[card.id]),
	)

	const selectedCards = {
		hermits: currentDeck.cards.filter(
			(card) => CARDS[card.id].category === 'hermit',
		),
		items: currentDeck.cards.filter(
			(card) => CARDS[card.id].category === 'item',
		),
		attachableEffects: currentDeck.cards.filter(
			(card) => CARDS[card.id].category === 'attach',
		),
		singleUseEffects: currentDeck.cards.filter(
			(card) => CARDS[card.id].category === 'single_use',
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

	const tagFilterAciton = (option: string) => {
		if (option.includes('No Tag')) {
			setFilteredDecks(filterDecks(databaseInfo.decks, {tag: null}))
			setTagFilter({
				name: 'No Tag',
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
		setFilteredDecks(filterDecks(databaseInfo.decks, {tag: parsedOption.key}))
		setTagFilter(parsedOption)
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'lastSelectedTag',
				value: parsedOption.key,
			},
		})
	}
	const typeFilterAction = (option: string) => {
		setFilteredDecks(filterDecks(databaseInfo.decks, {type: option}))
		setTypeFilter(option)
	}

	const nameFilterAction = (name: string) => {
		if (name === '') {
			setNameFilter('')
			setFilteredDecks(filterDecks(databaseInfo.decks, {name: name}))
			return
		}
		setNameFilter(name)
		setFilteredDecks(filterDecks(databaseInfo.decks, {name: name}))
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
				cards={sortCardInstances(loadedDeck.cards).map(
					(card) => CARDS[card.id],
				)}
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
				title="Deck Editor"
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
									{loadedDeck.cards.length}/{CONFIG.game.limits.maxCards}{' '}
									<span className={css.hideOnMobile}>cards</span>
								</p>
								<div className={css.cardCount}>
									<p className={css.tokens}>
										{getDeckCost(
											loadedDeck.cards.map((card) => CARDS[card.id]),
										)}
										/{CONFIG.game.limits.maxDeckCost}{' '}
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
										{loadedDeck.cards.length}/{CONFIG.game.limits.maxCards}
									</div>
									<div className={classNames(css.mobileDeckStat, css.tokens)}>
										{getDeckCost(
											loadedDeck.cards.map((card) => CARDS[card.id]),
										)}
										/{CONFIG.game.limits.maxDeckCost}
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
									<div className={css.deckList}>
										{deckList.length ? (
											deckList
										) : (
											<p className={css.noResults}>No decks found.</p>
										)}
									</div>
								</div>
							</div>
							<div className={css.mobileTags}>
								<FilterComponent
									tagFilter={tagFilter}
									tagFilterAction={tagFilterAciton}
									typeFilter={typeFilter}
									typeFilterAction={typeFilterAction}
									nameFilterAction={nameFilterAction}
									dropdownDirection={'up'}
								></FilterComponent>
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
								<Button
									variant="default"
									onClick={() => setShowManageTagsModal(!showManageTagsModal)}
									size="small"
									disabled={databaseInfo.noConnection}
								>
									<span>Tags</span>
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
							variant="default"
							size="small"
							onClick={() => setShowScreenshotModal(true)}
						>
							<ViewFullDeckIcon />
							<span>View Full Deck</span>
						</Button>
						<Button
							variant="primary"
							size="small"
							onClick={() => setShowDuplicateDeckModal(true)}
							leftSlot={CopyIcon()}
						>
							<span>Duplicate Deck</span>
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
								<FilterComponent
									tagFilter={tagFilter}
									tagFilterAction={tagFilterAciton}
									typeFilter={typeFilter}
									typeFilterAction={typeFilterAction}
									nameFilterAction={nameFilterAction}
									dropdownDirection={'up'}
								></FilterComponent>
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
					{deckList.length ? (
						deckList
					) : (
						<p className={css.noResults}>No decks found.</p>
					)}
				</DeckLayout.Sidebar>
			</DeckLayout>
		</>
	)
}

export default SelectDeck
