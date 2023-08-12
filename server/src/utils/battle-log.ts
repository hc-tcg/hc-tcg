import {call, delay} from 'typed-redux-saga'
import {GameModel} from '../../../common/models/game-model'
import {
	BattleLogT,
	BattleLogDescriptionT,
	PlayerState,
	RowStateWithHermit,
} from '../../../common/types/game-state'
import {CARDS, HERMIT_CARDS} from 'common/cards'
import {PlayCardActionData, AttackActionData} from 'common/types/action-data'
import {CurrentCoinFlipT} from '../../../common/types/game-state'

function format(
	text: string,
	format: 'plain' | 'highlight' | 'player' | 'opponent',
	condition: 'player' | 'opponent' | undefined = undefined
): BattleLogDescriptionT {
	const output: BattleLogDescriptionT = {
		text: text,
		format: format,
	}
	if (condition) output.condition = condition
	return output
}

function getBattleLogHeight(battleLog: BattleLogT[]): number {
	const smallLength = battleLog.filter(
		(e) => (e.secondIcon !== undefined && e.small === undefined) || e.small
	).length
	return smallLength * 25 + (battleLog.length - smallLength) * 40
}

function* sendBattleLogEntry(game: GameModel) {
	while (getBattleLogHeight(game.battleLog) > 500) {
		game.battleLog.shift()
	}
	game.getPlayers().forEach((player) => {
		player.socket.emit('BATTLE_LOG_ENTRY', {
			type: 'BATTLE_LOG_ENTRY',
			payload: game.battleLog,
		})
	})
}

export function* addPlayCardEntry(game: GameModel, turnAction: PlayCardActionData) {
	const currentPlayer = game.currentPlayer.playerName

	const card = turnAction.payload.card
	const cardType = CARDS[card.cardId].type
	const cardName = CARDS[card.cardId].name

	if (cardType === 'hermit') {
		const hermitFullName = card.cardId.split('_')[0]
		const entry: BattleLogT = {
			player: game.currentPlayer.id,
			icon: `images/hermits-emoji/${hermitFullName}.png`,
			description: [
				format(`You `, 'plain', 'player'),
				format(`${currentPlayer} `, 'plain', 'opponent'),
				format(`placed `, 'plain'),
				format(`${cardName} `, 'player'),
			],
		}
		game.battleLog.push(entry)
	} else if (cardType === 'item') {
		const item_name = card.cardId.split('_')[1]
		const attachedHermit = turnAction.payload.pickedSlot.row?.state.hermitCard
		if (!attachedHermit) return

		const attachedHermitName = CARDS[attachedHermit.cardId].name
		const attachedHermitFullName = attachedHermit.cardId.split('_')[0]

		const entry: BattleLogT = {
			player: game.currentPlayer.id,
			icon: `images/hermits-emoji/${attachedHermitFullName}.png`,
			secondIcon: `images/types/type-${item_name}.png`,
			description: [
				format(`You `, 'plain', 'player'),
				format(`${currentPlayer} `, 'plain', 'opponent'),
				format(`attached `, 'plain'),
				format(`${cardName} item `, 'highlight'),
				format(`to `, 'plain'),
				format(`${attachedHermitName} `, 'player'),
			],
		}
		game.battleLog.push(entry)
	} else if (cardType === 'effect') {
		const attachedHermit = turnAction.payload.pickedSlot.row?.state.hermitCard
		if (!attachedHermit) return

		const attachedHermitName = CARDS[attachedHermit.cardId].name
		const attachedHermitFullName = attachedHermit.cardId.split('_')[0]

		const entry: BattleLogT = {
			player: game.currentPlayer.id,
			icon: `images/hermits-emoji/${attachedHermitFullName}.png`,
			secondIcon: `images/effects/${card.cardId}.png`,
			description: [
				format(`You `, 'plain', 'player'),
				format(`${currentPlayer} `, 'plain', 'opponent'),
				format(`attached `, 'plain'),
				format(`${cardName} `, 'highlight'),
				format(`to `, 'plain'),
				format(`${attachedHermitName} `, 'player'),
			],
		}
		game.battleLog.push(entry)
	} else {
		return
	}

	yield* call(sendBattleLogEntry, game)
}

export function* addApplyEffectEntry(game: GameModel) {
	const currentPlayer = game.currentPlayer.playerName

	const card = game.currentPlayer.board.singleUseCard
	if (!card) return
	const card_name = CARDS[card.cardId].name

	const entry: BattleLogT = {
		player: game.currentPlayer.id,
		icon: `images/effects/${card.cardId}.png`,
		description: [
			format(`You `, 'plain', 'player'),
			format(`${currentPlayer} `, 'plain', 'opponent'),
			format(`used `, 'plain'),
			format(`${card_name}`, 'highlight'),
		],
	}
	game.battleLog.push(entry)
}

export function* addChangeHermitEntry(game: GameModel, turnAction: any) {
	const currentPlayer = game.currentPlayer.playerName

	const pickedHermit = turnAction?.payload?.row?.state?.hermitCard?.cardId
	if (!pickedHermit) return
	const pickedHermitFullName = pickedHermit.split('_')[0]
	const pickedHermitName = CARDS[pickedHermit].name

	const activeRow = game.currentPlayer.board.activeRow
	if (activeRow === null) return
	const activeHermitId = game.currentPlayer.board.rows[activeRow].hermitCard?.cardId
	if (activeHermitId === undefined) return
	const activeHermit = HERMIT_CARDS[activeHermitId]
	const activeHermitFullName = activeHermitId.split('_')[0]

	const entry: BattleLogT = {
		player: game.currentPlayer.id,
		icon: `images/hermits-emoji/${activeHermitFullName}.png`,
		secondIcon: `images/hermits-emoji/${pickedHermitFullName}.png`,
		description: [
			format(`You `, 'plain', 'player'),
			format(`${currentPlayer} `, 'plain', 'opponent'),
			format(`swapped `, 'plain'),
			format(`${activeHermit.name} `, 'player'),
			format(`for `, 'plain'),
			format(`${pickedHermitName} `, 'player'),
		],
		small: false,
		cornerLayout: true,
	}
	game.battleLog.push(entry)

	yield* call(sendBattleLogEntry, game)
}

export function* addAttackEntry(game: GameModel, turnAction: AttackActionData) {
	const currentPlayer = game.currentPlayer.playerName
	const otherPlayer = game.opponentPlayer.playerName
	const type = turnAction.type

	const activeRow = game.activeRow
	if (activeRow === null) return
	const activeHermitId = activeRow.hermitCard?.cardId
	if (activeHermitId === undefined) return
	const activeHermit = HERMIT_CARDS[activeHermitId]
	const hermit_full_name = activeHermitId.split('_')[0]

	const opponentActiveRow = game.opponentActiveRow
	if (opponentActiveRow === null) return
	const opponentActiveHermitId = opponentActiveRow.hermitCard?.cardId
	if (opponentActiveHermitId === undefined) return
	const opponentActiveHermit = HERMIT_CARDS[opponentActiveHermitId]

	const attackName =
		type === 'PRIMARY_ATTACK' ? activeHermit.primary.name : activeHermit.secondary.name

	const entry: BattleLogT = {
		player: game.currentPlayer.id,
		icon: `images/hermits-emoji/${hermit_full_name}.png`,
		secondIcon: `images/icons/attack.png`,
		description: [
			format(`Your `, 'plain', 'player'),
			format(`${currentPlayer}'s `, 'plain', 'opponent'),
			format(`${activeHermit.name} `, 'player'),
			format(`attacked `, 'plain'),
			format(`${opponentActiveHermit.name} `, 'opponent'),
			format(`with `, 'plain'),
			format(`${attackName} `, 'highlight'),
		],
	}
	game.battleLog.push(entry)

	const singleUse = game.currentPlayer.board.singleUseCard
	const singleUseUsed = game.currentPlayer.board.singleUseCardUsed
	if (singleUse !== null && !singleUseUsed) {
		const singleUseName = CARDS[singleUse.cardId].name
		const singleUseEntry = {
			player: game.currentPlayer.id,
			icon: `images/effects/${singleUse.cardId}.png`,
			description: [
				format(`Your `, 'plain', 'player'),
				format(`${currentPlayer}'s `, 'plain', 'opponent'),
				format(`${activeHermit.name} `, 'player'),
				format(`attacked `, 'plain'),
				format(`${opponentActiveHermit.name} `, 'opponent'),
				format(`with `, 'plain'),
				format(`${singleUseName} `, 'highlight'),
			],
		}
		game.battleLog.push(singleUseEntry)
	}

	yield* call(sendBattleLogEntry, game)
}

export function* addCoinFlipEntry(game: GameModel, coinFlips: Array<CurrentCoinFlipT>) {
	const otherPlayer = game.opponentPlayer.playerName

	if (coinFlips.length === 0) return
	for (const coinFlip of coinFlips) {
		const name = coinFlip.name
		const cardName = CARDS[coinFlip.cardId].name

		const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
		const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

		let description_body = ''

		if (coinFlip.tosses.length === 1) {
			description_body = heads > tails ? `flipped heads on ` : `flipped tails on `
		} else if (tails === 0) {
			description_body = `flipped ${heads} heads on `
		} else if (heads === 0) {
			description_body = `flipped ${tails} tails on `
		} else {
			description_body = `flipped ${heads} heads and ${tails} tails on `
		}

		const entry: BattleLogT = {
			player: game.currentPlayer.id,
			icon: `images/icons/coins/${heads}_heads_${tails}_tails.png`,
			description: [],
			renderingMode: 'auto',
		}

		if (HERMIT_CARDS[coinFlip.cardId]) {
			entry.description = [
				format(`Your `, 'plain', 'player'),
				format(`${otherPlayer}'s `, 'plain', 'opponent'),
				format(`${cardName} `, coinFlip.opponentFlip ? 'opponent' : 'player'),
				format(description_body + 'their attack', 'plain'),
			]
		} else {
			entry.description = [
				format(`You `, 'plain', 'player'),
				format(`${otherPlayer} `, 'plain', 'opponent'),
				format(description_body, 'plain'),
				format(`${cardName} `, 'highlight'),
			]
		}

		game.battleLog.push(entry)
	}

	yield* call(delay, 2600 * coinFlips.length)
	yield* call(sendBattleLogEntry, game)
}

export function* addAilmentEntry(game: GameModel, player: PlayerState) {
	const otherPlayer = game.opponentPlayer.playerName

	for (let i = 0; i < player.board.rows.length; i++) {
		const row = player.board.rows[i]
		if (!row.health) continue

		const hasFire = !!row.ailments.find((a) => a.id === 'fire')
		const hasPoison = !!row.ailments.find((a) => a.id === 'poison')

		const hermitId = row.hermitCard.cardId
		const hermitFullName = hermitId.split('_')[0]
		const hermitName = CARDS[hermitId].name

		if (hasFire) {
			const entry: BattleLogT = {
				player: game.opponentPlayer.id,
				icon: `images/effects/lava_bucket.png`,
				secondIcon: `images/hermits-emoji/${hermitFullName}.png`,
				description: [
					format(`${otherPlayer}'s `, 'plain', 'opponent'),
					format(`Your `, 'plain', 'player'),
					format(`${hermitName} `, 'player'),
					format(`took fire damage`, 'plain'),
				],
			}
			game.battleLog.push(entry)
		} else if (hasPoison) {
			// Calculate max poison damage
			const poisonDamage = Math.max(Math.min(row.health - 10, 20), 0)
			if (poisonDamage === 0) break
			const entry: BattleLogT = {
				player: game.opponentPlayer.id,
				icon: `images/effects/splash_potion_of_poison.png`,
				secondIcon: `images/hermits-emoji/${hermitFullName}.png`,
				description: [
					format(`${otherPlayer}'s `, 'plain', 'opponent'),
					format(`Your `, 'plain', 'player'),
					format(`${hermitName} `, 'player'),
					format(`took poison damage`, 'plain'),
				],
			}
			game.battleLog.push(entry)
		}
	}

	yield* call(sendBattleLogEntry, game)
}

export function* addDeathEntry(game: GameModel, playerState: PlayerState, row: RowStateWithHermit) {
	const card = row.hermitCard
	const cardName = CARDS[card.cardId].name
	const hermitFullName = card.cardId.split('_')[0]

	const entry: BattleLogT = {
		player: playerState.id,
		icon: `images/hermits-emoji/${hermitFullName}.png`,
		description: [
			format(`Your `, 'plain', 'player'),
			format(`${playerState.playerName}'s `, 'plain', 'opponent'),
			format(`${cardName} `, 'player'),
			format(`was knocked out `, 'plain'),
		],
		grayscale: true,
	}
	game.battleLog.push(entry)

	const heartsEntry: BattleLogT = {
		player: playerState.id,
		icon: `images/game/heart_full.png`,
		description: [
			format(`You `, 'plain', 'player'),
			format(`${playerState.playerName} `, 'plain', 'opponent'),
			format(`have `, 'plain', 'player'),
			format(`has `, 'plain', 'opponent'),
			format(`one life remaining`, 'plain'),
		],
		small: true,
		renderingMode: 'auto',
	}

	if (playerState.lives === 3) {
		heartsEntry.secondIcon = `images/game/heart_full.png`
		heartsEntry.description[4] = format(`two lives remaining`, 'plain')
	}

	game.battleLog.push(heartsEntry)

	// wait for coinflips to call sendBattleLogEntry if there are any
	if (game.currentPlayer.coinFlips.length === 0) {
		yield* call(sendBattleLogEntry, game)
	}
}

export function* addTimeoutEntry(game: GameModel) {
	const entry: BattleLogT = {
		player: game.currentPlayer.id,
		icon: `images/icons/timeout.png`,
		description: [
			format(`You `, 'plain', 'player'),
			format(`${game.currentPlayer} `, 'plain', 'opponent'),
			format(`ran out of time `, 'plain'),
		],
		renderingMode: 'auto',
		small: true,
	}
	game.battleLog.push(entry)

	yield* call(sendBattleLogEntry, game)
}
