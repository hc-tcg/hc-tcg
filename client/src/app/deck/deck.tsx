import classnames from 'classnames'
import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const universe = [
	'bdoubleo100_common',
	'bdoubleo100_rare',
	'bed',
	'bow',
	'chest',
	'chorus_fruit',
	'clock',
	'composter',
	'crossbow',
	'cubfan135_common',
	'cubfan135_rare',
	'curse_of_binding',
	'curse_of_vanishing',
	'diamond_armor',
	'diamond_sword',
	'docm77_common',
	'docm77_rare',
	'efficiency',
	'emerald',
	'ethoslab_common',
	'ethoslab_rare',
	'ethoslab_ultra_rare',
	'falsesymmetry_common',
	'falsesymmetry_rare',
	'fishing_rod',
	'flint_&_steel',
	'fortune',
	'geminitay_common',
	'geminitay_rare',
	'gold_armor',
	'golden_apple',
	'golden_axe',
	'goodtimeswithscar_common',
	'goodtimeswithscar_rare',
	'grian_common',
	'grian_rare',
	'hypnotizd_common',
	'hypnotizd_rare',
	'ijevin_common',
	'ijevin_rare',
	'impulsesv_common',
	'impulsesv_rare',
	'instant_health',
	'instant_health_ii',
	'invisibility_potion',
	'iron_armor',
	'iron_sword',
	'iskall85_common',
	'iskall85_rare',
	'item_balanced_common',
	'item_balanced_rare',
	'item_builder_common',
	'item_builder_rare',
	'item_explorer_common',
	'item_explorer_rare',
	'item_farm_common',
	'item_farm_rare',
	'item_miner_common',
	'item_miner_rare',
	'item_prankster_common',
	'item_prankster_rare',
	'item_pvp_common',
	'item_pvp_rare',
	'item_redstone_common',
	'item_redstone_rare',
	'item_speedrunner_common',
	'item_speedrunner_rare',
	'item_terraform_common',
	'item_terraform_rare',
	'joehills_common',
	'joehills_rare',
	'keralis_common',
	'keralis_rare',
	'knockback',
	'lava_bucket',
	'lead',
	'looting',
	'loyalty',
	'mending',
	'milk_bucket',
	'mumbojumbo_common',
	'mumbojumbo_rare',
	'netherite_armor',
	'netherite_sword',
	'pearlescentmoon_common',
	'pearlescentmoon_rare',
	'rendog_common',
	'rendog_rare',
	'shield',
	'splash_potion_of_healing',
	'splash_potion_of_poison',
	'spyglass',
	'stressmonster101_common',
	'stressmonster101_rare',
	'tangotek_common',
	'tangotek_rare',
	'thorns',
	'tinfoilchef_common',
	'tinfoilchef_rare',
	'tinfoilchef_ultra_rare',
	'tnt',
	'totem',
	'vintagebeef_common',
	'vintagebeef_rare',
	'vintagebeef_ultra_rare',
	'water_bucket',
	'welsknight_common',
	'welsknight_rare',
	'wolf',
	'xbcrafted_common',
	'xbcrafted_rare',
	'xisumavoid_common',
	'xisumavoid_rare',
	'zedaphplays_common',
	'zedaphplays_rare',
	'zombiecleo_common',
	'zombiecleo_rare',
]

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

const sortCards = (cards: Array<CardT>): Array<CardT> => {
	return cards.slice().sort((a: CardT, b: CardT) => {
		const cardInfoA = TYPED_CARDS[a.cardId]
		const cardInfoB = TYPED_CARDS[b.cardId]
		if (cardInfoA.type !== cardInfoB.type) {
			return TYPE_ORDER[cardInfoA.type] - TYPE_ORDER[cardInfoB.type]
		} else if (
			cardInfoA.type === 'hermit' &&
			cardInfoB.type === 'hermit' &&
			cardInfoA.hermitType !== cardInfoB.hermitType
		) {
			return cardInfoA.hermitType.localeCompare(cardInfoB.hermitType)
		}
		return cardInfoA.name.localeCompare(cardInfoB.name)
	})
}

type Props = {
	setMenuSection: (section: string) => void
}
const Deck = ({setMenuSection}: Props) => {
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.map((cardId) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

	const [deckName, setDeckName] = useState<string>('')
	const [exportCode, setExportCode] = useState<string>('')

	const commonCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'common'
	)
	const rareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'rare'
	)
	const ultraRareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'ultra_rare'
	)

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))

	const addCard = (card: CardT) => {
		setPickedCards((pickedCards) => {
			return [
				...pickedCards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			]
		})
	}
	const removeCard = (card: CardT) => {
		setPickedCards((pickedCards) =>
			pickedCards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			)
		)
	}
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('mainmenu')
	}

	const clearDeck = () => {
		setPickedCards([])
	}
	const saveDeck = () => {
		localStorage.setItem('Loadout_' + deckName, JSON.stringify(pickedCards))
		console.log(JSON.stringify(pickedCards))
	}
	const loadDeck = () => {
		const deck = localStorage.getItem('Loadout_' + deckName)
		if (!deck) return
		const deckIds = JSON.parse(deck).filter(
			(card: CardT) => TYPED_CARDS[card.cardId]
		)
		setPickedCards(deckIds)
	}
	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

	const importDeck = () => {
		const b64 = atob(deckName)
			.split('')
			.map((char) => char.charCodeAt(0))
		const deck = []
		for (let i = 0; i < b64.length; i++) {
			deck.push({
				cardId: universe[b64[i]],
				cardInstance: Math.random().toString(),
			})
		}
		console.log(deck)
		if (!deck) return
		const deckIds = deck.filter((card: CardT) => TYPED_CARDS[card.cardId])
		setPickedCards(deckIds)
	}

	const exportDeck = () => {
		const indicies = []
		console.log(JSON.stringify(pickedCards[0].cardId))
		for (let i = 0; i < pickedCards.length; i++) {
			indicies.push(universe.indexOf(String(pickedCards[i].cardId)))
		}
		console.log(indicies)
		const b64cards = btoa(String.fromCharCode.apply(null, indicies))
		console.log(b64cards)
		setExportCode(b64cards)
		console.log(exportCode)
	}

	const sortedAllCards = sortCards(allCards)
	const sortedDeckCards = sortCards(pickedCards)

	return (
		<div className={css.deck}>
			<div className={css.header}>
				<button disabled={!!validationMessage} onClick={backToMenu}>
					Back
				</button>
				<div className={css.limits}>
					{validationMessage ? validationMessage : exportCode}
				</div>
				<div className={css.dynamicSpace} />
				<button onClick={clearDeck}>Clear</button>
				<div>
					<button type="button" onClick={importDeck}>
						Import
					</button>
					<button type="button" onClick={exportDeck}>
						Export
					</button>
					<input
						maxLength={60}
						name="deckName"
						placeholder="Deck Name..."
						onBlur={(e) => {
							setDeckName(e.target.value)
						}}
					/>
					<button type="button" onClick={saveDeck}>
						Save
					</button>
					<button type="button" onClick={loadDeck}>
						Load
					</button>
				</div>
			</div>
			<div className={css.cards}>
				<div className={classnames(css.cardColumn, css.allCards)}>
					<div className={css.cardsTitle}>All cards</div>
					<CardList
						cards={sortedAllCards}
						onClick={addCard}
						size="small"
						wrap={true}
					/>
				</div>
				<div className={classnames(css.cardColumn, css.selectedCards)}>
					<div className={css.cardsTitle}>
						<span>Your deck ({pickedCards.length})</span>
						<span> - </span>
						<span className={css.commonAmount} title="Common">
							{commonCards.length}
						</span>
						<span> </span>
						<span className={css.rareAmount} title="Rare">
							{rareCards.length}
						</span>
						<span> </span>
						<span className={css.ultraRareAmount} title="Ultra rare">
							{ultraRareCards.length}
						</span>
					</div>
					<CardList
						cards={sortedDeckCards}
						onClick={removeCard}
						size="small"
						wrap={true}
					/>
				</div>
			</div>
		</div>
	)
}

export default Deck
