import {CurrentCoinFlip, BattleLogT} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {GameModel} from './game-model'
import {formatText} from '../utils/formatting'
import {DEBUG_CONFIG} from '../config'
import {StatusEffectLog} from '../status-effects/status-effect'
import {CardComponent, PlayerComponent, RowComponent, SlotComponent} from '../components'
import {card, slot} from '../components/query'
import {isHermit} from '../cards/base/types'
import {CardEntity, PlayerEntity, RowEntity, StatusEffectEntity} from '../entities'

export class BattleLogModel {
	private game: GameModel
	private logMessageQueue: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game

		/** Log entries that still need to be processed */
		this.logMessageQueue = []
	}

	private generateEffectEntryHeader(card: CardComponent | null): string {
		const currentPlayer = this.game.currentPlayer.playerName
		if (!card) return ''
		return `$p{You|${currentPlayer}}$ used $e${card.props.name}$ `
	}

	private generateCoinFlipDescription(coinFlip: CurrentCoinFlip): string {
		const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
		const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

		if (coinFlip.tosses.length === 1) {
			return heads > tails ? `flipped $gheads$` : `flipped $btails$`
		} else if (tails === 0) {
			return `flipped $g${heads} heads$`
		} else if (heads === 0) {
			return `flipped $b${tails} tails$`
		} else {
			return `flipped $g${heads} heads$ and $b${tails} tails$`
		}
	}

	private generateCoinFlipMessage(
		attack: AttackModel,
		coinFlips: Array<CurrentCoinFlip>
	): string | null {
		const entry = coinFlips.reduce((r: string | null, coinFlip) => {
			const description = this.generateCoinFlipDescription(coinFlip)

			let coinFlipCard = this.game.components.get(coinFlip.card)

			if (!coinFlip) return r
			if (coinFlip.opponentFlip) return r
			if (coinFlipCard?.isHermit() && attack.type === 'effect') return r
			if (coinFlipCard?.isHermit() && attack.type !== 'effect') return r

			return description
		}, null)

		return entry
	}

	public async sendLogs() {
		while (this.logMessageQueue.length > 0) {
			const firstEntry = this.logMessageQueue.shift()
			if (!firstEntry) return
			let playerId = this.game.components.get(firstEntry.player)?.id
			if (!playerId) continue

			this.game.chat.push({
				createdAt: Date.now(),
				message: formatText(firstEntry.description, {censor: true}),
				sender: playerId,
				systemMessage: true,
			})
		}

		await new Promise((e) =>
			setTimeout(
				e,
				this.game.currentPlayer.coinFlips.reduce((r, flip) => r + flip.delay, 0)
			)
		)

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addPlayCardEntry(
		card: CardComponent,
		coinFlips: Array<CurrentCoinFlip>,
		slotInfo: SlotComponent | null
	) {
		let {player, opponentPlayer} = card

		const genCardName = (
			player: PlayerComponent | undefined,
			card: CardComponent | null | undefined,
			row: RowComponent | null | undefined
		) => {
			if (card == null) return invalid

			if (
				card.props.category === 'hermit' &&
				player &&
				player.activeRowEntity !== row?.entity &&
				row?.index
			) {
				return `${card.props.name} (${row?.index + 1})`
			}

			return `${card.props.name}`
		}

		let row = slotInfo?.inRow() ? slotInfo.row : null
		let cardInfo = slotInfo?.getCard()

		const thisFlip = coinFlips.find((flip) => flip.card == card.entity)
		const invalid = '$bINVALID VALUE$'

		const logMessage = card.card.getLog({
			player: player.playerName,
			opponent: opponentPlayer.playerName,
			coinFlip: thisFlip ? this.generateCoinFlipDescription(thisFlip) : '',
			defaultLog: `$p{You|${player.playerName}}$ used $e${card.props.name}$`,
			pos: {
				rowIndex: card.slot.inRow() ? `${card.slot.row.index + 1}` : invalid,
				id: card.props.id || invalid,
				name: genCardName(card.player, card, row),
				hermitCard: genCardName(card.player, cardInfo, row),
				slotType: card.slot.type,
			},
			pick: {
				rowIndex: row !== null ? `${row.index + 1}` : invalid,
				id: cardInfo?.card.props.id || invalid,
				name: cardInfo ? genCardName(slotInfo?.player, card, row) : invalid,
				hermitCard: genCardName(slotInfo?.player, cardInfo, row),
				slotType: slotInfo?.type || invalid,
			},
		})

		if (logMessage.length === 0) return

		this.logMessageQueue.unshift({
			player: player.entity,
			description: logMessage,
		})

		this.sendLogs()
	}

	public addAttackEntry(
		attack: AttackModel,
		coinFlips: Array<CurrentCoinFlip>,
		singleUse: CardComponent | null
	) {
		if (!attack.attacker) return

		const attacks = [attack, ...attack.nextAttacks]

		let log = attacks.reduce((reducer, subAttack) => {
			if (subAttack.type !== attack.type) {
				this.addAttackEntry(subAttack, coinFlips, singleUse)
				return reducer
			}

			if (!attack.attacker || !attack.target) return reducer

			if (subAttack.getDamage() === 0) return reducer

			const attackingHermitInfo = this.game.components.find(
				CardComponent,
				card.currentPlayer,
				card.active,
				card.slot(slot.hermit)
			)
			const targetHermitInfo = this.game.components.find(
				CardComponent,
				card.opponentPlayer,
				card.active,
				card.slot(slot.hermit)
			)

			const targetFormatting = attack.target.player.id === attack.player.id ? 'p' : 'o'

			const rowNumberString = `(${attack.target.index + 1})`

			if (!(attackingHermitInfo instanceof CardComponent)) return reducer
			let attackName
			if (attackingHermitInfo.isHermit()) {
				attackName =
					subAttack.type === 'primary'
						? attackingHermitInfo.props.primary.name
						: attackingHermitInfo.props.secondary.name
			} else {
				attackName = singleUse?.props.name || '$eINVALID$'
			}

			const logMessage = subAttack.getLog({
				attacker: `$p${attackingHermitInfo.props.name}$`,
				player: attack.player.playerName,
				opponent: attack.target.player.playerName,
				target: `$${targetFormatting}${targetHermitInfo?.props?.name} ${rowNumberString}$`,
				attackName: `$v${attackName}$`,
				damage: `$b${subAttack.calculateDamage()}hp$`,
				defaultLog: this.generateEffectEntryHeader(singleUse),
				coinFlip: this.generateCoinFlipMessage(attack, coinFlips),
			})

			reducer += logMessage

			return reducer
		}, '' as string)

		if (log.length === 0) return

		log += DEBUG_CONFIG.logAttackHistory
			? attack.getHistory().reduce((reduce, hist) => {
					return reduce + `\n\t${hist.source} → ${hist.type} ${hist.value}`
			  }, '')
			: ''

		this.logMessageQueue.push({
			player: attack.player.entity,
			description: log,
		})
	}

	public opponentCoinFlipEntry(coinFlips: Array<CurrentCoinFlip>) {
		const player = this.game.currentPlayer
		// Opponent coin flips
		coinFlips.forEach((coinFlip) => {
			if (!coinFlip.opponentFlip) return

			this.logMessageQueue.push({
				player: player.entity,
				description: `$o${
					this.game.components.get(coinFlip.card)?.props.name
				}$ ${this.generateCoinFlipDescription(coinFlip)} on their coinflip`,
			})
		})
	}

	public addEntry(player: PlayerEntity, entry: string) {
		this.logMessageQueue.push({
			player: player,
			description: entry,
		})
	}

	public addChangeRowEntry(
		player: PlayerComponent,
		newRowEntity: RowEntity,
		oldHermitEntity: CardEntity | null,
		newHermitEntity: CardEntity | null
	) {
		let newRow = this.game.components.get(newRowEntity)
		let oldHermit = this.game.components.get(oldHermitEntity)
		let newHermit = this.game.components.get(newHermitEntity)

		if (!newRow || !oldHermit || !newHermit) return

		if (oldHermit) {
			this.logMessageQueue.push({
				player: player.entity,
				description: `$p{You|${player.playerName}}$ swapped $p${oldHermit.props.name}$ for $p${
					newHermit.props.name
				} (${newRow.index + 1})$`,
			})
		} else {
			this.logMessageQueue.push({
				player: player.entity,
				description: `$p{You|${player.playerName}}$ activated $p${newHermit.props.name} (${
					newRow.index + 1
				})$`,
			})
		}
	}

	public addDeathEntry(playerEntity: PlayerEntity, row: RowEntity) {
		const hermitCard = this.game.components.find(CardComponent, card.isHermit, card.rowEntity(row))
		if (!hermitCard) return
		const cardName = hermitCard.props.name
		let player = this.game.components.get(playerEntity)

		const livesRemaining = player?.lives === 3 ? 'two lives' : 'one life'

		this.logMessageQueue.push({
			player: playerEntity,
			description: `$p${cardName}$ was knocked out, and $p{you|${player?.playerName}}$ now {have|has} $b${livesRemaining}$ remaining`,
		})
		this.sendLogs()
	}

	public addTurnEndEntry() {
		this.game.chat.push({
			createdAt: Date.now(),
			message: {TYPE: 'LineNode'},
			sender: this.game.opponentPlayer.id,
			systemMessage: true,
		})

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addStatusEffectEntry(
		statusEffect: StatusEffectEntity,
		log: (values: StatusEffectLog) => string
	) {
		const effect = this.game.components.get(statusEffect)
		if (!effect) return
		const pos = effect.target
		if (!pos) return

		if (pos instanceof CardComponent) {
			const targetFormatting = pos.player.entity === this.game.currentPlayerEntity ? 'p' : 'o'
			const rowNumberString = (pos.slot.inRow() && pos.slot.row.index.toString()) || 'Unknown Row'

			const logMessage = log({
				target: `$${targetFormatting}${pos.props.name} ${rowNumberString}$`,
				statusEffect: `$e${effect.props.name}$`,
			})

			this.logMessageQueue.push({
				player: this.game.currentPlayerEntity,
				description: logMessage,
			})
		} else if (pos instanceof PlayerComponent) {
			const targetFormatting = pos.entity === this.game.currentPlayerEntity ? 'p' : 'o'

			const logMessage = log({
				target: `$${targetFormatting}{you|${pos.playerName}}$`,
				statusEffect: `$e${effect.props.name}$`,
			})

			this.logMessageQueue.push({
				player: this.game.currentPlayerEntity,
				description: logMessage,
			})
		}

		this.sendLogs()
	}
}
