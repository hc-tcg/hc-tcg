import assert from 'assert'
import PharaohRare from 'common/cards/advent-of-tcg/hermits/pharaoh-rare'
import PythonGBRare from 'common/cards/advent-of-tcg/hermits/pythongb-rare'
import {DiamondArmor, NetheriteArmor} from 'common/cards/attach/armor'
import TurtleShell from 'common/cards/attach/turtle-shell'
import Cubfan135Common from 'common/cards/hermits/cubfan135-common'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import JinglerCommon from 'common/cards/hermits/jingler-common'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import SpeedrunnerItem from 'common/cards/items/speedrunner-common'
import SpeedrunnerDoubleItem from 'common/cards/items/speedrunner-rare'
import Clock from 'common/cards/single-use/clock'
import GoldenApple from 'common/cards/single-use/golden-apple'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {Card, Hermit} from 'common/cards/types'
import {
	HandSlotComponent,
	PlayerComponent,
	RowComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {player} from 'common/components/query/card'
import {GameModel} from 'common/models/game-model'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {PointLightHelper} from 'three'

const howMuchILikeMyHermits: Array<Card['id']> = [
	PharaohRare.id,
	Cubfan135Rare.id,
	JinglerRare.id,
	Cubfan135Common.id,
	JinglerCommon.id,
]

// Get the most powerful hermit from a list of cards
function getBestHermit(array: Array<Hermit>) {
	array.sort((a, b) => {
		return (
			howMuchILikeMyHermits.indexOf(a.id) - howMuchILikeMyHermits.indexOf(b.id)
		)
	})

	return array[0]
}

// Get the most powerful hermit from a list of cards
function getBestHermitOnBoard(game: GameModel, pharaoh: PlayerComponent) {
	let hermits = game.components.filter(
		RowComponent,
		query.row.hasHermit,
		query.row.player(pharaoh.entity),
	)
	hermits.sort((a, b) => {
		assert(a.health && b.health)
		if (a.health > b.health) return 1
		if (b.health > a.health) return 0
		return (
			howMuchILikeMyHermits.indexOf(a.getHermit()!.props.id) -
			howMuchILikeMyHermits.indexOf(a.getHermit()!.props.id)
		)
	})

	return hermits[0]
}

function getOpponentHermitDamage(
	game: GameModel,
	pharaoh: PlayerComponent,
): number {
	const opponentActive = pharaoh.opponentPlayer.getActiveHermit()

	if (!opponentActive) return 0
	if (!opponentActive.isHermit()) return 0

	let oponentPOWER = pharaoh.opponentPlayer.getAvailableEnergy()
	if (!oponentPOWER) return 0

	let canUsePrimary = hasEnoughEnergy(
		oponentPOWER,
		opponentActive.getAttackCost('primary'),
		game.settings.noItemRequirements,
	)
	let canUseSecondary = hasEnoughEnergy(
		oponentPOWER,
		opponentActive.getAttackCost('primary'),
		game.settings.noItemRequirements,
	)

	if (!canUsePrimary && !canUseSecondary) {
		return 0
	}

	if (canUsePrimary && !canUseSecondary) {
		if (canUseSecondary) {
			return opponentActive.props.primary.damage
		}
	}

	if (canUseSecondary) {
		return opponentActive.props.secondary.damage
	}

	return 0
}

// Start the game! We will not have a hermit on the board at this point.
function gameStartup() {}

function shouldPlayItemCard(
	game: GameModel,
	pharaoh: PlayerComponent,
): [RowComponent, HandSlotComponent] | null {
	if (!pharaoh.getAavailableActions().includes('PLAY_ITEM_CARD')) {
		return null
	}

	let activeHermit = pharaoh.getActiveHermit()

	let shouldPowerUpActive =
		activeHermit?.isHermit() &&
		!hasEnoughEnergy(
			pharaoh.getAvailableEnergy(),
			activeHermit?.props.secondary.cost,
			false,
		)

	// @todo Play item of correct type
	if (shouldPowerUpActive) {
		let canPowerUpHermit = pharaoh.getHand().find((c) => c.isItem())
		if (canPowerUpHermit) {
			return [pharaoh.activeRow!, canPowerUpHermit.slot as HandSlotComponent]
		}
	}

	return null
}

function playItemCard() {}

function decideToSwap(
	game: GameModel,
	pharaoh: PlayerComponent,
	myActiveHP: number,
	opponentDamage: number,
): boolean {
	if (!pharaoh.getAavailableActions().includes('CHANGE_ACTIVE_HERMIT')) {
		return false
	}

	let bestSwapCandidate = game.components
		.filter(RowComponent, query.row.player(pharaoh.entity), query.row.hasHermit)
		.filter((x) => x.health)
		.sort((a, b) => {
			assert(a.health)
			assert(b.health)

			return a.health > b.health ? 1 : 0
		})[0]

	if (
		bestSwapCandidate.getHermit()?.entity === pharaoh.getActiveHermit()?.entity
	) {
		return false
	}

	let bestSwapCandidateHealth = bestSwapCandidate.health!

	if (bestSwapCandidateHealth < myActiveHP) {
		return false
	}

	// TNT does 60 damage and is the highest damage effect card
	if (opponentDamage + 60 < myActiveHP) {
		// We are 100% going to live! Yay!
		return false
	}

	// TNT does 60 damage and is the highest damage effect card
	if (opponentDamage + 40 < myActiveHP) {
		// Some single uses can kill us
		return game.rng() > 0.8
	}

	if (opponentDamage + 20 < myActiveHP) {
		return game.rng() > 0.4
	}

	if (opponentDamage + 10 < myActiveHP) {
		// Many single uses can kill us
		return game.rng() > 0.5
	}

	if (opponentDamage > myActiveHP) {
		// Lets swap because we will die.
		return false
	}

	return false
}

function swapActiveHermit(
	game: GameModel,
	pharaoh: PlayerComponent,
): AnyTurnActionData {
	let bestSwap = getBestHermitOnBoard(game, pharaoh)

	return {
		type: 'CHANGE_ACTIVE_HERMIT',
		entity: bestSwap.getHermitSlot().entity,
	}
}

// Get how dangerous it would be if we do not swap hermits
function getNextTurnAction(game: GameModel, pharaoh: PlayerComponent) {
	let opponentDamge = getOpponentHermitDamage(game, pharaoh)
	let myActiveHP = pharaoh.activeRow?.health

	if (!myActiveHP) {
		// We do not have a hermit on the board
		return gameStartup()
	}

	if (decideToSwap(game, pharaoh, myActiveHP, opponentDamge)) {
		return swapActiveHermit(game, pharaoh)
	}
}

const PharaohBossAI: VirtualAI = {
	id: 'pharaoh_boss',
	getDeck(): Array<Card> {
		return [
			PharaohRare,
			PharaohRare,
			PharaohRare,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Rare,
			Cubfan135Rare,
			Cubfan135Rare,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			GoldenApple,
			Clock,
			NetheriteArmor,
			DiamondArmor,
			DiamondArmor,
			PotionOfWeakness,
			LavaBucket,
			InstantHealthII,
			InstantHealthII,
			TurtleShell,
			TurtleShell,
		]
	},
	setup(_game) {},
	getTurnActions: function* (
		game,
		component,
	): Generator<any, any, AnyTurnActionData> {
		while (true) {
			yield getNextTurnAction(game, component.player)
		}
	},
}
export default PharaohBossAI
