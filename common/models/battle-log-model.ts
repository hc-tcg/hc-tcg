import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
} from '../components'
import query from '../components/query'
import {DEBUG_CONFIG} from '../config'
import {
	CardEntity,
	PlayerEntity,
	RowEntity,
	StatusEffectEntity,
} from '../entities'
import {StatusEffectLog} from '../status-effects/status-effect'
import {BattleLogT, CurrentCoinFlip, Message} from '../types/game-state'
import {LineNode, formatText} from '../utils/formatting'
import {AttackModel} from './attack-model'
import {GameModel} from './game-model'

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
		return `$p{You|${currentPlayer}}$ used $e${card.props.name}$`
	}

	private generateCoinFlipDescription(coinFlip: CurrentCoinFlip): string {
		const heads = coinFlip.tosses.filter(
			(flip) => flip.result === 'heads',
		).length
		const tails = coinFlip.tosses.filter(
			(flip) => flip.result === 'tails',
		).length

		if (coinFlip.tosses.length === 1) {
			return heads > tails ? 'flipped $gheads$' : 'flipped $btails$'
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
		coinFlips: Array<CurrentCoinFlip>,
	): string | null {
		const entry = coinFlips.reduce((r: string | null, coinFlip) => {
			const description = this.generateCoinFlipDescription(coinFlip)

			let coinFlipCard = this.game.components.get(coinFlip.card)

			if (!coinFlip) return r
			if (coinFlip.opponentFlip) return r
			if (coinFlipCard?.isHermit() && attack.type === 'effect') return r
			if (coinFlipCard?.isSingleUse() && attack.type !== 'effect') return r

			return description
		}, null)

		return entry
	}

	public sendLogs() {
		let logs: Array<Message> = []

		while (this.logMessageQueue.length > 0) {
			const firstEntry = this.logMessageQueue.shift()
			if (!firstEntry) return

			let playerEntity = this.game.components.get(firstEntry.player)?.entity
			if (!playerEntity) continue

			logs.push({
				sender: {
					type: 'system',
					id: playerEntity,
				},
				createdAt: Date.now(),
				message: formatText(firstEntry.description, {censor: true}),
			})

			if (this.game.settings.verboseLogging) {
				console.info(`${this.game.logHeader} ${firstEntry.description}`)
			}

			if (!this.game.settings.logErrorsToStderr) {
				if (firstEntry.description.includes('INVALID VALUE')) {
					throw new Error(`Invalid battle log found: ${firstEntry.description}`)
				}
			}
		}

		const timeout = this.game.currentPlayer.coinFlips.reduce(
			(r, flip) => r + flip.delay,
			0,
		)
		this.game.publishBattleLog(logs, timeout)
	}

	private genCardName(
		player: PlayerComponent | undefined,
		card: CardComponent | null | undefined,
		row: RowComponent | null | undefined,
	) {
		if (card == null) return '$bINVALID VALUE$'

		if (
			card.slot.type === 'hermit' &&
			player &&
			player.activeRowEntity !== row?.entity &&
			row?.index !== undefined
		) {
			return card.turnedOver
				? `??? (${row.index + 1})`
				: `${card.props.name} (${row?.index + 1})`
		}

		return card.turnedOver ? '???' : `${card.props.name}`
	}

	public addPlayCardEntry(
		card: CardComponent,
		coinFlips: Array<CurrentCoinFlip>,
		pickedSlot: SlotComponent | null,
	) {
		let {player, opponentPlayer} = card

		const cardRow = card.slot.inRow() ? card.slot.row : null
		const pickedRow = pickedSlot?.inRow() ? pickedSlot.row : null
		const pickedCard = pickedSlot?.getCard()

		const thisFlip = coinFlips.find((flip) => flip.card == card.entity)
		const invalid = '$bINVALID VALUE$'

		const logMessage = card.props.getLog({
			player: player.playerName,
			opponent: opponentPlayer.playerName,
			coinFlip: thisFlip ? this.generateCoinFlipDescription(thisFlip) : '',
			defaultLog: `$p{You|${player.playerName}}$ used $e${card.props.name}$`,
			pos: {
				rowIndex: cardRow ? `${cardRow.index + 1}` : invalid,
				id: card.props.id,
				name: this.genCardName(card.player, card, cardRow),
				hermitCard: this.genCardName(
					card.player,
					cardRow?.getHermit(),
					cardRow,
				),
				slotType: card.slot.type,
			},
			pick: {
				rowIndex: pickedRow !== null ? `${pickedRow.index + 1}` : invalid,
				id: pickedCard?.props.id || invalid,
				name: pickedCard
					? this.genCardName(pickedSlot?.player, pickedCard, pickedRow)
					: invalid,
				hermitCard: this.genCardName(
					pickedSlot?.player,
					pickedRow?.getHermit(),
					pickedRow,
				),
				slotType: pickedSlot?.type || invalid,
			},
			game: this.game,
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
		singleUse: CardComponent | null,
	) {
		if (!attack.attacker) return

		const getAllSubattacks = (thisAttack: AttackModel): Array<AttackModel> => {
			if (thisAttack.type !== attack.type) return [thisAttack]
			return [thisAttack, ...thisAttack.nextAttacks.flatMap(getAllSubattacks)]
		}

		const attacks = getAllSubattacks(attack)

		let log = attacks.reduce((reducer, subAttack) => {
			if (subAttack.type !== attack.type) {
				this.addAttackEntry(subAttack, coinFlips, singleUse)
				return reducer
			}

			if (!attack.attacker || !subAttack.target) return reducer

			if (subAttack.getDamage() === 0) return reducer

			const attackerInfo = attack.attacker

			const targetFormatting =
				subAttack.target.player.entity === attack.player.entity ? 'p' : 'o'

			const weaknessAttack = attacks.find((a) => a.isType('weakness'))
			const weaknessDamage =
				attack.isType('primary', 'secondary') &&
				attack.createWeakness !== 'never' &&
				weaknessAttack
					? weaknessAttack.calculateDamage()
					: 0

			let attackName
			if (attackerInfo instanceof CardComponent && attackerInfo.isHermit()) {
				attackName =
					subAttack.type === 'primary'
						? attackerInfo.props.primary.name
						: attackerInfo.props.secondary.name
			} else {
				attackName = singleUse?.props.name || '$eINVALID$'
			}

			const logMessage = subAttack.getLog({
				attacker: `$p${attackerInfo.props.name}$`,
				player: attack.player.playerName,
				opponent: attack.player.opponentPlayer.playerName,
				target: `$${targetFormatting}${this.genCardName(
					subAttack.target.player,
					subAttack.target.getHermit(),
					subAttack.target,
				)}$`,
				attackName: `$v${attackName}$`,
				damage: `$b${subAttack.calculateDamage() + weaknessDamage}hp$`,
				defaultLog: this.generateEffectEntryHeader(singleUse),
				coinFlip: this.generateCoinFlipMessage(attack, coinFlips),
				attack: subAttack,
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
		newHermitEntity: CardEntity | null,
	) {
		let newRow = this.game.components.get(newRowEntity)
		let oldHermit = this.game.components.get(oldHermitEntity)
		let newHermit = this.game.components.get(newHermitEntity)

		if (!newRow || !newHermit) return

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
		const hermitCard = this.game.components.find(
			CardComponent,
			query.card.isHermit,
			query.card.rowEntity(row),
		)
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

	public addTurnStartEntry() {
		this.game.publishBattleLog(
			[
				{
					sender: {
						type: 'system',
						id: this.game.currentPlayer.entity,
					},
					createdAt: Date.now(),
					message: LineNode(),
				},
			],
			0,
		)
	}

	public addStatusEffectEntry(
		statusEffect: StatusEffectEntity,
		log: (values: StatusEffectLog) => string,
	) {
		const effect = this.game.components.get(statusEffect)
		if (!effect) return
		const pos = effect.target
		if (!pos) return

		if (pos instanceof CardComponent) {
			const targetFormatting =
				pos.player.entity === this.game.currentPlayerEntity ? 'p' : 'o'
			const rowNumberString =
				(pos.slot.inRow() && (pos.slot.row.index + 1).toString()) ||
				'Unknown Row'

			const logMessage = log({
				target: `$${targetFormatting}${pos.props.name} (${rowNumberString})$`,
				verb: 'was',
				statusEffect: `$e${effect.props.name}$`,
			})

			this.logMessageQueue.push({
				player: this.game.currentPlayerEntity,
				description: logMessage,
			})
		} else if (pos instanceof PlayerComponent) {
			const targetFormatting =
				pos.entity === this.game.currentPlayerEntity ? 'p' : 'o'

			const logMessage = log({
				target: `$${targetFormatting}{You|${pos.playerName}}$`,
				verb: '{were|was}',
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
