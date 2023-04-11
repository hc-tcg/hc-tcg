import {useDeferredValue, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import classNames from 'classnames'
import {sortCards, cardGroupHeader, savedDeckNames} from './deck'
import css from './deck.module.scss'
import DeckLayout from './layout'
import CARDS from 'server/cards'
import {getCardRank, getTotalCost, validateDeck} from 'server/utils/validation'
import {CardInfoT, HermitCardT, ItemCardT} from 'common/types/cards'
import {CardT} from 'common/types/game-state'
import {PlayerDeckT} from 'common/types/deck'
import CardList from 'components/card-list'
import Accordion from 'components/accordion'
import Button from 'components/button'
import errorIcon from 'components/svgs/errorIcon'
import Dropdown from 'components/dropdown'
import AlertModal from 'components/alert-modal'
import {CONFIG} from '../../../../config'

const RANKS = ['any', 'stone', 'iron', 'gold', 'emerald', 'diamond']
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
const iconDropdownOptions = DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/types/type-${option}.png`,
}))
const rarityDropdownOptions = RANKS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/power/${option}.png`,
}))

type DeckNameT = {
	loadedDeck: PlayerDeckT
	setDeckName: (name: string) => void
	isValid: (valid: boolean) => void
}

const DeckName = ({loadedDeck, setDeckName, isValid}: DeckNameT) => {
	const [deckNameInput, setDeckNameInput] = useState<string>(
		loadedDeck.name === 'Default' ? '' : loadedDeck.name
	)
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
				pattern={`^[a-zA-Z0-9 ]*$`}
				onBlur={() => handleBlur()}
				data-focused={inputIsFocused}
			/>
			<p className={css.errorMessage}>
				Deck name should be between 1-32 characters and shouldn't include any
				special characters.
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

function EditDeck({back, title, saveDeck, deck}: Props) {
	const dispatch = useDispatch()

	// STATE
	const [textQuery, setTextQuery] = useState<string>('')
	const [rankQuery, setRankQuery] = useState<string>('')
	const [typeQuery, setTypeQuery] = useState<string>('')
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>(deck)
	const [validDeckName, setValidDeckName] = useState<boolean>(true)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false)
	const [showDefaultDeckModal, setShowDefaultDeckModal] =
		useState<boolean>(false)

	const deferredTextQuery = useDeferredValue(textQuery)

	//MISC
	const initialDeckState = deck
	const TYPED_CARDS = CARDS as Record<string, CardInfoT>
	const HTYPE_CARDS = CARDS as Record<string, HermitCardT | ItemCardT>
	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)
	const filteredCards: CardT[] = allCards.filter(
		(card) =>
			// Card Name Filter
			TYPED_CARDS[card.cardId].name
				.toLowerCase()
				.includes(deferredTextQuery.toLowerCase()) &&
			// Card Type Filter
			(HTYPE_CARDS[card.cardId].hermitType === undefined
				? TYPED_CARDS[card.cardId]
				: HTYPE_CARDS[card.cardId].hermitType.includes(typeQuery)) &&
			// Card Rarity Filter
			(rankQuery === '' || getCardRank(card.cardId) === rankQuery)
	)
	const selectedCards = {
		hermits: loadedDeck.cards.filter(
			(card) => TYPED_CARDS[card.cardId].type === 'hermit'
		),
		items: loadedDeck.cards.filter(
			(card) => TYPED_CARDS[card.cardId].type === 'item'
		),
		effects: loadedDeck.cards.filter(
			(card) =>
				TYPED_CARDS[card.cardId].type === 'effect' ||
				TYPED_CARDS[card.cardId].type === 'single_use'
		),
	}

	//CARD LOGIC
	const clearDeck = () => {
		setLoadedDeck({...loadedDeck, cards: []})
	}
	const addCard = (card: CardT) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: [
				...loadedDeck.cards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			],
		}))
	}
	const removeCard = (card: CardT) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: loadedDeck.cards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			),
		}))
	}

	//DECK LOGIC
	const clearFilters = () => {
		setTextQuery('')
		setRankQuery('')
		setTypeQuery('')
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
		console.log(`HERE:`)

		//If deck name is empty, do nothing
		if (newDeck.name === '') return

		//If editing 'Default' deck, prevent overwriting and create new deck
		if (newDeck.name === 'Default') {
			return setShowDefaultDeckModal(true)
		}

		// Check to see if deck name already exists in Local Storage.
		//TODO: Can't use includes as it will match partial values in names. Need match to be exact.
		if (
			savedDeckNames.includes(newDeck.name) &&
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
		dispatch({
			type: 'SET_TOAST',
			payload: {
				open: true,
				title: 'Deck Saved!',
				description: `Saved ${deck.name}`,
				image: `/images/types/type-${deck.icon}.png`,
			},
		})
		back()
	}
	const validationMessage = validateDeck(
		loadedDeck.cards.map((card) => card.cardId)
	)

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
			<AlertModal
				setOpen={showDefaultDeckModal}
				onClose={() => setShowDefaultDeckModal(!showDefaultDeckModal)}
				action={() => null}
				title="Default Deck"
				description="You cannot make changes to the default deck. Give the deck a new name in order to save it."
				actionText="Edit"
			/>
			<DeckLayout title={title} back={handleBack}>
				<DeckLayout.Main
					header={
						<>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/power/${
												rankQuery === '' ? 'any' : rankQuery
											}.png`}
										/>
									</button>
								}
								label="Rarity Filter"
								options={rarityDropdownOptions}
								action={(option) =>
									setRankQuery(option === 'any' ? '' : option)
								}
							/>
							<Dropdown
								button={
									<button className={css.dropdownButton}>
										<img
											src={`/images/types/type-${
												typeQuery === '' ? 'any' : typeQuery
											}.png`}
										/>
									</button>
								}
								label="Type Filter"
								options={iconDropdownOptions}
								action={(option) =>
									setTypeQuery(option === 'any' ? '' : option)
								}
							/>
							<input
								placeholder="Search cards..."
								className={css.input}
								value={textQuery}
								onChange={(e) => setTextQuery(e.target.value)}
							/>
							<div className={css.dynamicSpace} />
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
							cards={sortCards(filteredCards).filter(
								(card) => TYPED_CARDS[card.cardId].type === 'hermit'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Items'}>
						<CardList
							cards={sortCards(filteredCards).filter(
								(card) => TYPED_CARDS[card.cardId].type === 'item'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Effects'}>
						<CardList
							cards={sortCards(filteredCards).filter(
								(card) =>
									TYPED_CARDS[card.cardId].type === 'effect' ||
									TYPED_CARDS[card.cardId].type === 'single_use'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
				</DeckLayout.Main>
				<DeckLayout.Sidebar
					width="half"
					header={
						<>
							<p>My Cards</p>
							<div className={css.dynamicSpace} />
							<div className={css.deckDetails}>
								<p
									className={classNames(
										css.cardCount,
										css.dark,
										loadedDeck.cards.length != CONFIG.limits.maxCards
											? css.error
											: null
									)}
								>
									{loadedDeck.cards.length}/{CONFIG.limits.maxCards} cards
								</p>
								<div className={classNames(css.cardCount, css.dark)}>
									<p className={css.ultraRare}>
										{getTotalCost(loadedDeck.cards.map((card) => card.cardId))}/
										{CONFIG.limits.maxDeckCost} tokens
									</p>
								</div>
							</div>
						</>
					}
					footer={
						<Button
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

						<div className={css.editDeckInfo}>
							<label htmlFor="deckname">Deck Name and Icon</label>
							<div className={css.editDeckInfoSettings}>
								<Dropdown
									button={
										<button className={css.dropdownButton}>
											<img src={`/images/types/type-${loadedDeck.icon}.png`} />
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

						<div style={{zIndex: '-1'}}>
							<Accordion
								header={cardGroupHeader('Hermits', selectedCards.hermits)}
							>
								<CardList
									cards={sortCards(selectedCards.hermits)}
									size="small"
									wrap={true}
									onClick={removeCard}
								/>
							</Accordion>
						</div>
						<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
							<CardList
								cards={sortCards(selectedCards.items)}
								size="small"
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
						<Accordion
							header={cardGroupHeader('Effects', selectedCards.effects)}
						>
							<CardList
								cards={sortCards(selectedCards.effects)}
								size="small"
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
						<Button
							variant="stone"
							size="small"
							style={{margin: '0.5rem'}}
							onClick={clearDeck}
							disabled={loadedDeck.cards.length == 0}
						>
							Remove All
						</Button>
					</div>
				</DeckLayout.Sidebar>
			</DeckLayout>
		</>
	)
}

export default EditDeck
