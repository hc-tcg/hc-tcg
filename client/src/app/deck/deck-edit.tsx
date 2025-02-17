import classNames from 'classnames'
import {CARDS_LIST} from 'common/cards'
import {isHermit, isItem} from 'common/cards/types'
import {EXPANSIONS, ExpansionT} from 'common/const/expansions'
import {CardEntity, newEntity} from 'common/entities'
import {Deck, Tag} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {sortCardInstances} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {getCardRank, getDeckCost} from 'common/utils/ranks'
import {getIconPath} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import Button from 'components/button'
import CardList from 'components/card-list'
import MobileCardList from 'components/card-list/mobile-card-list'
import Checkbox from 'components/checkbox'
import Dropdown from 'components/dropdown'
import ColorPickerDropdown from 'components/dropdown/color-picker-dropdown'
import {ConfirmModal} from 'components/modal'
import errorIcon from 'components/svgs/errorIcon'
import {DatabaseInfo} from 'logic/game/database/database-reducer'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useDeferredValue, useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import css from './deck.module.scss'
import DeckLayout from './layout'

const RANK_NAMES = ['any', 'stone', 'iron', 'gold', 'emerald', 'diamond']
const ITEM_DECK_ICONS = [
	'any',
	'balanced',
	'builder',
	'explorer',
	'farm',
	'miner',
	'prankster',
	'pvp',
	'redstone',
	'speedrunner',
	'terraform',
]

const HERMIT_DECK_ICONS = [
	'bdoubleo100',
	'beetlejhost',
	'boomerbdubs',
	'cubfan135',
	'docm77',
	'dwarfimpulse',
	'ethoslab',
	'eviljevin',
	'evilxisuma',
	'falsesymmetry',
	'fiveampearl',
	'frenchkeralis',
	'geminitay',
	'goodtimeswithscar',
	'architectfalse',
	'grian',
	'helsknight',
	'horseheadhypno',
	'hotguy',
	'humancleo',
	'hypnotizd',
	'ijevin',
	'impulsesv',
	'jingler',
	'joehills',
	'keralis',
	'llamadad',
	'mumbojumbo',
	'pearlescentmoon',
	'potatoboy',
	'poultryman',
	'princessgem',
	'renbob',
	'rendog',
	'shadee',
	'skizzleman',
	'smallishbeans',
	'stressmonster101',
	'spookystress',
	'tangotek',
	'tinfoilchef',
	'vintagebeef',
	'welsknight',
	'wormman',
	'xbcrafted',
	'xisumavoid',
	'zedaphplays',
	'zombiecleo',
]

const EFFECT_DECK_ICONS = [
	'bed',
	'clock',
	'fishing_rod',
	'diamond_armor',
	'diamond_sword',
	'egg',
	'golden_apple',
	'fortune',
	'bad_omen',
]

const EXPANSION_NAMES = [
	'any',
	...Object.keys(EXPANSIONS).filter((expansion) => {
		return CARDS_LIST.some(
			(card) =>
				card.expansion === expansion &&
				EXPANSIONS[expansion].disabled === false &&
				!(
					CONFIG.limits.bannedCards.includes(card.id) ||
					CONFIG.limits.disabledCards.includes(card.id)
				),
		)
	}),
]

const iconDropdownOptions = ITEM_DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/types/type-${option}.png`,
}))

const hermitDropdownOptions = HERMIT_DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/hermits-emoji/${option}.png`,
}))

const effectDropdownOptions = EFFECT_DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/effects/${option}.png`,
}))

const rarityDropdownOptions = RANK_NAMES.map((option) => ({
	name: option,
	key: option,
	icon: `/images/ranks/${option}.png`,
}))

const expansionDropdownOptions = EXPANSION_NAMES.map((option) => ({
	name: option in EXPANSIONS ? EXPANSIONS[option as ExpansionT].name : 'Any',
	key: option,
	icon: `/images/expansion-icons/${option}.png`,
}))

type DeckNameT = {
	loadedDeck: Deck
	setDeckName: (name: string) => void
	isValid: (valid: boolean) => void
}

const DeckName = ({loadedDeck, setDeckName, isValid}: DeckNameT) => {
	const [deckNameInput, setDeckNameInput] = useState<string>(loadedDeck.name)
	const [inputIsFocused, setInputIsFocused] = useState<boolean>(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleBlur = () => {
		setInputIsFocused(true)
		setDeckName(deckNameInput)
		isValid(inputRef.current?.validity.valid || false)
	}

	return (
		<div className={css.inputValidationGroup}>
			<input
				ref={inputRef}
				id="deckname"
				type="text"
				value={deckNameInput}
				onChange={(e) => setDeckNameInput(e.target.value)}
				maxLength={32}
				placeholder="Enter Deck Name..."
				className={css.input}
				required={true}
				onBlur={() => handleBlur()}
				data-focused={inputIsFocused}
			/>
			<p className={css.errorMessage}>
				Deck name should be between 1-32 characters.
			</p>
		</div>
	)
}

const addTag = (
	tags: Array<Tag>,
	setTags: React.Dispatch<React.SetStateAction<Tag[]>>,
	color: string,
	key: string,
	setColor: React.Dispatch<React.SetStateAction<string>>,
	ev: React.SyntheticEvent<HTMLFormElement>,
) => {
	ev.preventDefault()
	const tag = {name: ev.currentTarget.tag.value.trim(), color: color, key: key}
	if (tags.includes(tag)) return
	if (tags.length >= 3) return
	if (tag.name.length === 0) return
	setTags([...tags, tag])
	setColor(color)
}

const addCreatedTag = (
	deckTags: Array<Tag>,
	setTags: React.Dispatch<React.SetStateAction<Tag[]>>,
	newTag: Tag,
) => {
	if (deckTags.includes(newTag)) return
	if (deckTags.length >= 3) return
	setTags([...deckTags, newTag])
}

type Props = {
	back: () => void
	title: string
	saveDeck: (loadedDeck: Deck) => void
	updateDeck: (loadedDeck: Deck) => void
	deleteDeck: (initialDeck: Deck) => void
	databaseInfo: DatabaseInfo
	deck: Deck | null
}

const ALL_CARDS = sortCardInstances(
	CARDS_LIST.filter(
		(card) =>
			// Don't show disabled cards
			EXPANSIONS[card.expansion].disabled === false &&
			!(
				CONFIG.limits.bannedCards.includes(card.id) ||
				CONFIG.limits.disabledCards.includes(card.id)
			),
	).map(
		(card): LocalCardInstance => ({
			props: WithoutFunctions(card),
			entity: newEntity('deck_editor_card'),
			slot: null,
			attackHint: null,
			turnedOver: false,
			prizeCard: false,
		}),
	),
)

function EditDeck({
	back,
	title,
	saveDeck,
	updateDeck,
	deleteDeck,
	deck,
	databaseInfo,
}: Props) {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)

	// STATE
	const [textQuery, setTextQuery] = useState<string>('')
	const [rankQuery, setRankQuery] = useState<string>('')
	const [typeQuery, setTypeQuery] = useState<string>('')
	const [expansionQuery, setExpansionQuery] = useState<Array<string>>([])
	const [loadedDeck, setLoadedDeck] = useState<Deck>(
		deck
			? deck
			: {
					name: '',
					iconType: 'item',
					icon: 'any',
					cards: [],
					code: generateDatabaseCode(),
					tags: [],
					public: false,
				},
	)
	const [validDeckName, setValidDeckName] = useState<boolean>(true)
	const [isPublic, setIsPublic] = useState<boolean>(loadedDeck.public)
	const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false)
	const deferredTextQuery = useDeferredValue(textQuery)
	const [color, setColor] = useState('#ff0000')
	const [nextKey, setNextKey] = useState<string>(generateDatabaseCode())
	const [tags, setTags] = useState<Array<Tag>>(loadedDeck.tags)
	const tagNameRef = useRef<HTMLInputElement>(null)

	const tagsDropdownOptions = databaseInfo.tags.map((option) => ({
		name: option.name,
		key: JSON.stringify(option),
		color: option.color,
		icon: '',
	}))

	useEffect(() => {
		window.addEventListener('keydown', handleTooltipKey)
		return () => {
			window.removeEventListener('keydown', handleTooltipKey)
		}
	}, [handleTooltipKey])

	function handleTooltipKey(e: any) {
		if (e.key === 't' || e.key == 'T') {
			toggleTooltips()
		}
	}

	function toggleTooltips() {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'showAdvancedTooltips',
				value: !settings.showAdvancedTooltips,
			},
		})
	}

	//MISC
	const initialDeckState = deck

	const filteredCards: LocalCardInstance[] = sortCardInstances(
		ALL_CARDS.filter(
			(card) =>
				// Card Name Filter
				card.props.name
					.toLowerCase()
					.includes(deferredTextQuery.toLowerCase()) &&
				// Card Rarity Filter
				(rankQuery === '' || getCardRank(card.props.tokens) === rankQuery) &&
				// Card Type Filter
				(typeQuery === '' ||
					!(isHermit(card.props) || isItem(card.props)) ||
					((isHermit(card.props) || isItem(card.props)) &&
						card.props.type.includes(typeQuery))) &&
				// Card Expansion Filter
				(expansionQuery.length === 0 ||
					expansionQuery.includes(card.props.expansion)) &&
				// Don't show disabled cards
				EXPANSIONS[card.props.expansion].disabled === false,
		),
	)

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

	//CARD LOGIC
	const clearDeck = () => {
		setLoadedDeck({...loadedDeck, cards: []})
	}
	const addCard = (card: LocalCardInstance) => {
		console.log('Card: ', card.props.id)
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: [
				...loadedDeck.cards,
				{
					props: card.props,
					entity: newEntity('card-entity') as CardEntity,
					slot: null,
					turnedOver: false,
					attackHint: null,
					prizeCard: false,
				},
			],
		}))
	}

	const removeCard = (card: LocalCardInstance) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: loadedDeck.cards.filter(
				(pickedCard) => pickedCard.entity !== card.entity,
			),
		}))
	}

	//DECK LOGIC
	const clearFilters = () => {
		setTextQuery('')
		setRankQuery('')
		setTypeQuery('')
		setExpansionQuery([])
	}
	const handleDeckIcon = (option: any) => {
		const getIcon = (): Deck['iconType'] => {
			if (ITEM_DECK_ICONS.includes(option)) return 'item'
			if (EFFECT_DECK_ICONS.includes(option)) return 'effect'
			return 'hermit'
		}
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			iconType: getIcon(),
			icon: option,
		}))
	}
	const handleBack = () => {
		if (initialDeckState && initialDeckState == loadedDeck) {
			back()
		} else {
			setShowUnsavedModal(true)
		}
	}
	const handleSave = () => {
		const newDeck = {...loadedDeck}

		// Check they are different
		if (
			initialDeckState &&
			newDeck &&
			newDeck.name === initialDeckState.name &&
			newDeck.icon === initialDeckState.icon &&
			newDeck.cards === initialDeckState.cards &&
			tags === initialDeckState.tags
		) {
			dispatch({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Deck Saved!',
				description: `Saved ${newDeck.name}`,
				image: getIconPath(newDeck),
			})
			back()
			return
		}

		//If deck name is empty, do nothing
		if (newDeck.name === '') return

		// Set up tags
		newDeck.tags = tags

		// New code
		if (!initialDeckState || newDeck.cards !== initialDeckState.cards) {
			newDeck.code = generateDatabaseCode()

			// Delete the old version of the deck
			if (initialDeckState) deleteDeck(initialDeckState)

			saveAndReturn(newDeck, 'insert')
		} else {
			saveAndReturn(newDeck, 'update')
		}
	}
	const saveAndReturn = (deck: Deck, type: 'insert' | 'update') => {
		const newTags = deck.tags.reduce((r: Array<Tag>, tag) => {
			if (databaseInfo.tags.find((subtag) => subtag.key === tag.key)) return r
			return [...r, tag]
		}, [])

		databaseInfo.tags.push(...newTags)
		if (type === 'insert') saveDeck(deck)
		else if (type === 'update') updateDeck(deck)
		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Deck Saved!',
			description: `Saved ${deck.name}`,
			image: getIconPath(deck),
		})
		back()
	}
	const validationResult = validateDeck(
		loadedDeck.cards.map((card) => card.props),
	)

	return (
		<>
			<ConfirmModal
				setOpen={showUnsavedModal}
				title="Leave Editor"
				description="Changes you have made will not be saved. Are you sure you want to leave?"
				confirmButtonText="Discard"
				onCancel={() => setShowUnsavedModal(!showUnsavedModal)}
				onConfirm={back}
			/>
			<DeckLayout title={title} back={handleBack} returnText="Deck Selection">
				<DeckLayout.Main
					header={
						<>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/ranks/${rankQuery === '' ? 'any' : rankQuery}.png`}
											draggable={false}
										/>
									</button>
								}
								label="Rank Filter"
								options={rarityDropdownOptions}
								showNames={true}
								action={(option) =>
									setRankQuery(option === 'any' ? '' : option)
								}
							/>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/types/type-${typeQuery === '' ? 'any' : typeQuery}.png`}
										/>
									</button>
								}
								label="Type Filter"
								options={iconDropdownOptions}
								showNames={true}
								action={(option) =>
									setTypeQuery(option === 'any' ? '' : option)
								}
							/>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/expansion-icons/${
												expansionQuery.length === 0 ? 'any' : expansionQuery[0]
											}.png`}
										/>
									</button>
								}
								label="Expansion Filter"
								options={expansionDropdownOptions}
								showNames={true}
								checkboxes={true}
								checked={expansionQuery}
								action={(option) =>
									setExpansionQuery(
										option === 'any'
											? []
											: expansionQuery.includes(option)
												? expansionQuery.filter((a) => a !== option)
												: [option, ...expansionQuery],
									)
								}
							/>
							<input
								placeholder="Search cards..."
								className={css.input}
								value={textQuery}
								onChange={(e) => setTextQuery(e.target.value)}
							/>
							<div className={css.dynamicSpace} />
							<button
								className={css.dropdownButton}
								title={
									settings.showAdvancedTooltips
										? 'Hide detailed tooltips (T)'
										: 'Show detailed tooltips (T)'
								}
								onClick={toggleTooltips}
							>
								<img
									src={
										settings.showAdvancedTooltips
											? '/images/toolbar/tooltips.png'
											: '/images/toolbar/tooltips-off.png'
									}
									height="30"
								/>
							</button>
							<Button
								size="small"
								variant="default"
								disabled={!textQuery && !rankQuery && !typeQuery}
								onClick={clearFilters}
							>
								<span className={css.hideOnMobile}>Clear Filter</span>
								<span className={css.showOnMobile}>Clear</span>
							</Button>
						</>
					}
				>
					<Accordion header={'Hermits'}>
						<CardList
							cards={filteredCards.filter(
								(card) => card.props.category === 'hermit',
							)}
							displayTokenCost={true}
							disableAnimations={true}
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Attachable Effects'}>
						<CardList
							cards={filteredCards.filter(
								(card) => card.props.category === 'attach',
							)}
							displayTokenCost={true}
							disableAnimations={true}
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Single Use Effects'}>
						<CardList
							cards={filteredCards.filter(
								(card) => card.props.category === 'single_use',
							)}
							displayTokenCost={true}
							disableAnimations={true}
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Items'}>
						<CardList
							cards={filteredCards.filter(
								(card) => card.props.category === 'item',
							)}
							displayTokenCost={true}
							disableAnimations={true}
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
				</DeckLayout.Main>
				<DeckLayout.Sidebar
					width="half"
					showHeader={true}
					showHeaderOnMobile={true}
					header={
						<>
							<p className={css.hideOnMobile} style={{textAlign: 'center'}}>
								My Cards
							</p>
							<div className={css.dynamicSpace} />
							<div className={css.deckDetails}>
								<p className={classNames(css.cardCount, css.dark)}>
									{loadedDeck.cards.length}/{CONFIG.limits.maxCards}
									<span className={css.hideOnMobile}>cards</span>
								</p>
								<p
									className={classNames(
										css.showOnMobile,
										css.cardCount,
										css.dark,
									)}
								>
									{
										loadedDeck.cards.filter(
											(card) => card.props.category === 'hermit',
										).length
									}
									H:
									{
										loadedDeck.cards.filter(
											(card) =>
												card.props.category === 'attach' ||
												card.props.category === 'single_use',
										).length
									}
									E:
									{
										loadedDeck.cards.filter(
											(card) => card.props.category === 'item',
										).length
									}
									I
								</p>
								<div
									className={classNames(css.cardCount, css.dark, css.tokens)}
								>
									{getDeckCost(loadedDeck.cards.map((card) => card.props))}/
									{CONFIG.limits.maxDeckCost}{' '}
									<span className={css.hideOnMobile}>tokens</span>
								</div>
							</div>
						</>
					}
					footer={
						<Button
							className={css.sidebarFooter}
							variant="primary"
							onClick={handleSave}
							style={{margin: '0.5rem'}}
							disabled={!validDeckName}
						>
							Save Deck
						</Button>
					}
				>
					<div style={{margin: '0.5rem'}}>
						{!validationResult.valid && (
							<div className={css.validationMessage}>
								<span style={{paddingRight: '0.5rem'}}>{errorIcon()}</span>{' '}
								{validationResult.reason}
							</div>
						)}

						<div className={css.upperEditDeck}>
							<div className={css.editDeckInfo}>
								<label htmlFor="deckname">Name and Icon</label>
								<div className={css.editDeckInfoSettings}>
									<Dropdown
										button={
											<button
												className={classNames(
													css.dropdownButton,
													css.usesIcon,
													css[loadedDeck.icon],
												)}
											>
												<img src={getIconPath(loadedDeck)} />
											</button>
										}
										label="Deck Icon"
										options={[
											...iconDropdownOptions,
											...hermitDropdownOptions,
											...effectDropdownOptions,
										]}
										showNames={false}
										grid={true}
										maxHeight={9}
										action={(option) => handleDeckIcon(option)}
									/>
									<DeckName
										loadedDeck={loadedDeck}
										isValid={(valid) => setValidDeckName(valid)}
										setDeckName={(deckName) =>
											setLoadedDeck({
												...loadedDeck,
												name: deckName,
											})
										}
									/>
									<div className={css.spacingItem}></div>
									<Button
										variant="default"
										size="small"
										onClick={clearDeck}
										className={css.removeButton}
									>
										Remove All
									</Button>
								</div>
								<div className={css.editDeckInfoSettings}>
									<p className={css.privacySettings}>
										Make name and icon public
									</p>
									<div className={css.spacingItem}></div>
									<Checkbox
										defaultChecked={isPublic}
										onCheck={(e) => {
											dispatch({
												type: localMessages.MAKE_INFO_PUBLIC,
												code: loadedDeck.code,
												public: e.currentTarget.checked,
											})
											const currentIndex = databaseInfo.decks.findIndex(
												(code) => code.code === loadedDeck.code,
											)
											databaseInfo.decks[currentIndex].public =
												e.currentTarget.checked
											setIsPublic(!e.currentTarget.checked)
										}}
									></Checkbox>
								</div>
								<label htmlFor="tags">Tags ({tags.length}/3)</label>
								<div className={css.deckTagsForm}>
									<Dropdown
										button={
											<button className={css.dropdownButton}>
												<img src="/images/icons/tag.png" />
											</button>
										}
										label="Saved Tags"
										options={tagsDropdownOptions}
										showNames={true}
										action={(option) => {
											const parsedTag = JSON.parse(option) as Tag
											addCreatedTag(tags, setTags, parsedTag)
										}}
									/>
									<ColorPickerDropdown
										button={
											<button
												className={css.dropdownButton}
												style={{backgroundColor: color}}
											></button>
										}
										action={setColor}
									/>
									<form
										className={css.deckTagsForm}
										onSubmit={(e) => {
											addTag(tags, setTags, color, nextKey, setColor, e)
											setNextKey(generateDatabaseCode())
										}}
									>
										<div className={css.customInput}>
											<input
												maxLength={25}
												name="tag"
												placeholder=" "
												className={css.input}
												id="tag"
												ref={tagNameRef}
											></input>
										</div>
										<Button
											variant="default"
											size="small"
											type="submit"
											className={css.submitButton}
											disabled={databaseInfo.noConnection}
										>
											Add
										</Button>
									</form>
								</div>
								<div className={css.tagList}>
									{tags.map((tag) => {
										return (
											<div
												className={css.fullTag}
												onClick={() =>
													setTags(
														tags.filter(
															(subtag) =>
																subtag.name !== tag.name &&
																subtag.color !== tag.color,
														),
													)
												}
											>
												<span
													className={css.fullTagColor}
													style={{backgroundColor: tag.color}}
												></span>
												{tag.name}
											</div>
										)
									})}
								</div>
							</div>
						</div>

						<div className={css.hideOnMobile}>
							<div style={{zIndex: '-1'}}>
								<Accordion
									header={cardGroupHeader('Hermits', selectedCards.hermits)}
								>
									<CardList
										cards={sortCardInstances(selectedCards.hermits)}
										displayTokenCost={true}
										wrap={true}
										onClick={removeCard}
									/>
								</Accordion>
							</div>
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
									onClick={removeCard}
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
									onClick={removeCard}
								/>
							</Accordion>
							<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
								<CardList
									cards={sortCardInstances(selectedCards.items)}
									displayTokenCost={true}
									wrap={true}
									onClick={removeCard}
								/>
							</Accordion>
						</div>

						<div className={css.showOnMobile}>
							Cards
							<MobileCardList
								cards={sortCardInstances(loadedDeck.cards)}
								small={false}
								onSubtractionClick={removeCard}
								onAdditionClick={addCard}
							/>
						</div>
					</div>
				</DeckLayout.Sidebar>
			</DeckLayout>
		</>
	)
}

export default EditDeck
