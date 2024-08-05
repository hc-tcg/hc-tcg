import classNames from 'classnames'
import {CARDS_LIST} from 'common/cards'
import Card from 'common/cards/base/card'
import {isHermit, isItem} from 'common/cards/base/types'
import {EXPANSIONS, ExpansionT} from 'common/const/expansions'
import {CardEntity, newEntity} from 'common/entities'
import {PlayerDeckT} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {getCardRank, getDeckCost} from 'common/utils/ranks'
import {validateDeck} from 'common/utils/validation'
import Accordion from 'components/accordion'
import AlertModal from 'components/alert-modal'
import Button from 'components/button'
import CardList from 'components/card-list'
import Dropdown from 'components/dropdown'
import errorIcon from 'components/svgs/errorIcon'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {deleteDeck, getSavedDeckNames} from 'logic/saved-decks/saved-decks'
import {setToast} from 'logic/session/session-actions'
import {useDeferredValue, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {CONFIG} from '../../../../common/config'
import {cardGroupHeader} from './deck'
import css from './deck.module.scss'
import DeckLayout from './layout'

const RANK_NAMES = ['any', 'stone', 'iron', 'gold', 'emerald', 'diamond']
const DECK_ICONS = [
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

const EXPANSION_NAMES = [
	'any',
	...Object.keys(EXPANSIONS).filter((expansion) => {
		return CARDS_LIST.some(
			(card) =>
				card.props.expansion === expansion &&
				EXPANSIONS[expansion].disabled === false,
		)
	}),
]

const iconDropdownOptions = DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/types/type-${option}.png`,
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
	loadedDeck: PlayerDeckT
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

type Props = {
	back: () => void
	title: string
	saveDeck: (loadedDeck: PlayerDeckT, initialDeck?: PlayerDeckT) => void
	deck: PlayerDeckT
}

const TYPE_ORDER = {
	hermit: 0,
	attach: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

// We want to fix UR with Rare to place all cards with abilities in the proper order.
const RARITY_ORDER = {
	common: 0,
	rare: 1,
	ultra_rare: 1,
}

export function sortCards(
	cards: Array<LocalCardInstance>,
): Array<LocalCardInstance> {
	return cards.slice().sort((a: LocalCardInstance, b: LocalCardInstance) => {
		return (
			[
				TYPE_ORDER[a.props.category] - TYPE_ORDER[b.props.category],
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.type.localeCompare(b.props.type),
				isItem(a.props) &&
					isItem(b.props) &&
					a.props.name.localeCompare(b.props.name),
				isHermit(a.props) &&
					isHermit(b.props) &&
					RARITY_ORDER[a.props.rarity] - RARITY_ORDER[b.props.rarity],
				a.props.tokens !== 'wild' &&
					b.props.tokens !== 'wild' &&
					a.props.tokens - b.props.tokens,
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.secondary.cost.length - b.props.secondary.cost.length,
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.secondary.damage - b.props.secondary.damage,
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.primary.cost.length - b.props.primary.cost.length,
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.primary.damage - b.props.primary.damage,
				isHermit(a.props) &&
					isHermit(b.props) &&
					a.props.health - b.props.health,
				a.props.name.localeCompare(b.props.name),
			].find(Boolean) || 0
		)
	})
}

const ALL_CARDS = sortCards(
	CARDS_LIST.map(
		(card: Card): LocalCardInstance => ({
			props: WithoutFunctions(card.props),
			entity: newEntity('deck_editor_card'),
			slot: null,
			attackHint: null,
			turnedOver: false,
		}),
	),
)

function EditDeck({back, title, saveDeck, deck}: Props) {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	// STATE
	const [textQuery, setTextQuery] = useState<string>('')
	const [rankQuery, setRankQuery] = useState<string>('')
	const [typeQuery, setTypeQuery] = useState<string>('')
	const [expansionQuery, setExpansionQuery] = useState<string>('')
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>(deck)
	const [validDeckName, setValidDeckName] = useState<boolean>(true)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false)
	const deferredTextQuery = useDeferredValue(textQuery)

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
		dispatch(
			setSetting(
				'showAdvancedTooltips',
				settings.showAdvancedTooltips === 'on' ? 'off' : 'on',
			),
		)
	}

	//MISC
	const initialDeckState = deck

	const filteredCards: LocalCardInstance[] = sortCards(
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
				(expansionQuery === '' || card.props.expansion === expansionQuery) &&
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
		setExpansionQuery('')
	}
	const handleDeckIcon = (option: any) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			icon: option,
		}))
	}
	const handleBack = () => {
		if (initialDeckState == loadedDeck) {
			back()
		} else {
			setShowUnsavedModal(true)
		}
	}
	const handleSave = () => {
		const newDeck = {...loadedDeck}

		// if the nae has been changed, delete the old one
		if (initialDeckState.name !== newDeck.name) {
			deleteDeck(initialDeckState.name)
		}

		//If deck name is empty, do nothing
		if (newDeck.name === '') return

		// Check to see if deck name already exists in Local Storage.
		if (
			getSavedDeckNames().find((name) => name === newDeck.name) &&
			initialDeckState.name !== newDeck.name
		) {
			return setShowOverwriteModal(true)
		}

		// Send toast and return to select deck screen
		saveAndReturn(newDeck, initialDeckState)
	}
	const overwrite = () => {
		const newDeck = {...loadedDeck}
		saveAndReturn(newDeck)
	}
	const saveAndReturn = (deck: PlayerDeckT, initialDeck?: PlayerDeckT) => {
		saveDeck(deck, initialDeck)
		dispatch(
			setToast({
				open: true,
				title: 'Deck Saved!',
				description: `Saved ${deck.name}`,
				image: `/images/types/type-${deck.icon}.png`,
			}),
		)
		back()
	}
	const validationMessage = validateDeck(loadedDeck.cards)

	return (
		<>
			<AlertModal
				setOpen={showOverwriteModal}
				onClose={() => setShowOverwriteModal(!showOverwriteModal)}
				action={overwrite}
				title="Overwrite Deck"
				description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
				actionText="Overwrite"
			/>
			<AlertModal
				setOpen={showUnsavedModal}
				onClose={() => setShowUnsavedModal(!showUnsavedModal)}
				action={back}
				title="Leave Editor"
				description="Changes you have made will not be saved. Are you sure you want to leave?"
				actionText="Discard"
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
								action={(option) =>
									setTypeQuery(option === 'any' ? '' : option)
								}
							/>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/expansion-icons/${
												expansionQuery === '' ? 'any' : expansionQuery
											}.png`}
										/>
									</button>
								}
								label="Expansion Filter"
								options={expansionDropdownOptions}
								action={(option) =>
									setExpansionQuery(option === 'any' ? '' : option)
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
									settings.showAdvancedTooltips === 'on'
										? 'Hide detailed tooltips (T)'
										: 'Show detailed tooltips (T)'
								}
								onClick={toggleTooltips}
							>
								<img
									src={
										settings.showAdvancedTooltips === 'on'
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
								Clear Filter
							</Button>
						</>
					}
				>
					<Accordion header={'Hermits'}>
						<CardList
							cards={filteredCards.filter(
								(card) => card.props.category === 'hermit',
							)}
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
							disableAnimations={true}
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
				</DeckLayout.Main>
				<DeckLayout.Sidebar
					width="half"
					header={
						<>
							<p style={{textAlign: 'center'}}>My Cards</p>
							<div className={css.dynamicSpace} />
							<div className={css.deckDetails}>
								<p className={classNames(css.cardCount, css.dark)}>
									{loadedDeck.cards.length}/{CONFIG.limits.maxCards}
									<span className={css.hideOnMobile}>cards</span>
								</p>
								<div
									className={classNames(css.cardCount, css.dark, css.tokens)}
								>
									{getDeckCost(loadedDeck.cards)}/{CONFIG.limits.maxDeckCost}{' '}
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
						{validationMessage && (
							<div className={css.validationMessage}>
								<span style={{paddingRight: '0.5rem'}}>{errorIcon()}</span>{' '}
								{validationMessage}
							</div>
						)}

						<div className={css.upperEditDeck}>
							<div className={css.editDeckInfo}>
								<label htmlFor="deckname">Deck Name and Icon</label>
								<div className={css.editDeckInfoSettings}>
									<Dropdown
										button={
											<button className={css.dropdownButton}>
												<img
													src={`/images/types/type-${loadedDeck.icon}.png`}
												/>
											</button>
										}
										label="Deck Icon"
										options={iconDropdownOptions}
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
								</div>
							</div>
							<Button
								variant="default"
								size="small"
								onClick={clearDeck}
								disabled={loadedDeck.cards.length == 0}
							>
								Remove All
							</Button>
						</div>

						<div style={{zIndex: '-1'}}>
							<Accordion
								header={cardGroupHeader('Hermits', selectedCards.hermits)}
							>
								<CardList
									cards={sortCards(selectedCards.hermits)}
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
								cards={sortCards(selectedCards.attachableEffects)}
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
								cards={sortCards(selectedCards.singleUseEffects)}
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
						<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
							<CardList
								cards={sortCards(selectedCards.items)}
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
					</div>
				</DeckLayout.Sidebar>
			</DeckLayout>
		</>
	)
}

export default EditDeck
