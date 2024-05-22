import {CARDS, HERMIT_CARDS} from '../cards'
import {AttackActionData, PlayCardActionData} from '../types/action-data'
import {
	MessageTextT,
	BattleLogT,
	CurrentCoinFlipT,
	PlayerState,
	RowStateWithHermit,
	CardT,
} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {getCardPos} from './card-pos-model'
import {GameModel} from './game-model'
import {formatLogEntry} from '../utils/chat'

export class BattleLogModel {
	private game: GameModel
	private log: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game
		this.log = []
	}

	private sendBattleLogEntry() {
		this.game.getPlayers().forEach((player) => {
			player.socket?.emit('BATTLE_LOG_ENTRY', {
				type: 'BATTLE_LOG_ENTRY',
				payload: this.log,
			})
		})

		while (this.log.length > 0) {
			const lastEntry = this.log.pop()
			if (!lastEntry) continue

			this.game.chat.push({
				createdAt: Date.now(),
				message: lastEntry.description,
				playerId: lastEntry.player,
				systemMessage: true,
			})
		}

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addPlayCardEntry(turnAction: PlayCardActionData) {
		const currentPlayer = this.game.currentPlayer.playerName

		const card = turnAction.payload.card
		const cardInfo = CARDS[card.cardId]

		const slot = turnAction.payload.pickInfo.slot

		const image = `images/hermits-emoji/${card.cardId.split('_')[0]}.png`

		if (slot.type === 'hermit') {
			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: formatLogEntry(
					`{$pYou$|$o${currentPlayer}$} placed $i${image}$ $p${cardInfo.name}$`
				),
			}
			this.log.push(entry)
		} else if (slot.type === 'item' || slot.type === 'effect') {
			const cardPosition = getCardPos(this.game, turnAction.payload.card.cardInstance)
			const attachedHermit = cardPosition?.row?.hermitCard
			if (!attachedHermit) return

			const attachedHermitName = CARDS[attachedHermit.cardId].name
			const image = `images/hermits-emoji/${attachedHermit.cardId.split('_')[0]}.png`

			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: formatLogEntry(
					`{$pYou$|$o${currentPlayer}$} attached $p${cardInfo.name}${
						cardInfo.type === 'item' ? ' item' : ''
					}${
						cardInfo.type === 'item' && cardInfo.rarity === 'rare' ? ' x2' : ''
					}$ to $i${image}$ $p${attachedHermitName}`
				),
			}
			this.log.push(entry)
		} else if (slot.type === 'single_use') {
			return
		}

		this.sendBattleLogEntry()
	}

	public addApplyEffectEntry(effectAction: string) {
		const currentPlayer = this.game.currentPlayer.playerName

		const card = this.game.currentPlayer.board.singleUseCard
		if (!card) return

		const cardInfo = CARDS[card.cardId]

		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: formatLogEntry(
				`{$pYou$|$o${currentPlayer}$} used $h${cardInfo.name}$ ` + effectAction
			),
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addChangeHermitEntry(oldHermit: CardT | null, newHermit: CardT | null) {
		if (!oldHermit || !newHermit) return
		const player = getCardPos(this.game, oldHermit.cardInstance)?.player
		if (!player) return

		const currentPlayer = this.game.currentPlayer === player

		const oldHermitInfo = CARDS[oldHermit.cardId]
		const newHermitInfo = CARDS[newHermit.cardId]

		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: formatLogEntry(
				`{$pYou$|$o${currentPlayer}$} swapped $p${oldHermitInfo.name}$ for $p${newHermitInfo.name}$`
			),
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addAttackEntry(attack: AttackModel) {
		const entry = attack.getLog()
		if (!entry) return
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addCustomEntry(entry: string, player: string) {
		const formattedEntry: BattleLogT = {
			player: player,
			description: formatLogEntry(entry),
		}

		this.log.push(formattedEntry)
		this.sendBattleLogEntry()
	}

	public async addCoinFlipEntry(coinFlips: Array<CurrentCoinFlipT>) {
		if (coinFlips.length === 0) return
		for (const coinFlip of coinFlips) {
			const cardName = CARDS[coinFlip.cardId].name

			const otherPlayer = coinFlip.opponentFlip
				? this.game.opponentPlayer.playerName
				: this.game.currentPlayer.playerName

			const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
			const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

			let description_body = ''

			if (coinFlip.tosses.length === 1) {
				description_body = heads > tails ? `flipped heads on ` : `flipped tails on `
			} else if (tails === 0) {
				description_body = `flipped all ${heads} heads on `
			} else if (heads === 0) {
				description_body = `flipped all ${tails} tails on `
			} else {
				description_body = `flipped ${heads} heads and ${tails} tails on `
			}

			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: [],
			}

			const image = `images/hermits-emoji/${coinFlip.cardId.split('_')[0]}.png`

			if (HERMIT_CARDS[coinFlip.cardId]) {
				entry.description = formatLogEntry(
					`{$pYour$|$o${otherPlayer}'s$} $i${image}$ $p${cardName}$ ${description_body} their attack`
				)
			} else {
				entry.description = formatLogEntry(
					`{$pYou$|$o${otherPlayer}$} ${description_body} $p${cardName}$`
				)
			}

			this.log.push(entry)
		}

		await new Promise((r) => setTimeout(r, 2000))

		this.sendBattleLogEntry()
	}

	public addDeathEntry(playerState: PlayerState, row: RowStateWithHermit) {
		const card = row.hermitCard
		const cardName = CARDS[card.cardId].name

		const livesRemaining = 3 ? 'two lives' : 'one life'

		const image = `images/hermits-emoji/${card.cardId.split('_')[0]}.png`

		const entry: BattleLogT = {
			player: playerState.id,
			description: formatLogEntry(
				`{$pYour$|$o${playerState.playerName}'s$} $i${image}$ $p${cardName}$ was knocked out, and {you|${playerState.playerName}} now {have|has} $h${livesRemaining}$ remaining`
			),
		}

		this.log.push(entry)

		// wait for coinflips to call sendBattleLogEntry if there are any
		if (this.game.currentPlayer.coinFlips.length === 0) {
			this.sendBattleLogEntry()
		}
	}

	public addTimeoutEntry() {
		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: formatLogEntry(`{You|${this.game.currentPlayer}} ran out of time`),
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}
}
