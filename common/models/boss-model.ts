import {PlayerModel} from './player-model'
import {GameModel} from './game-model'
import {getBossState} from '../utils/state-gen'

export class BossModel extends GameModel {
	constructor(player1: PlayerModel) {
		const EVIL_X_BOSS_PLAYER = new PlayerModel('EX', 'EvilXisuma', player1.socket)
		EVIL_X_BOSS_PLAYER.playerDeck = {
			name: 'Boss Deck',
			icon: 'Any',
			cards: [
				{
					cardId: 'evilxisuma_boss',
					cardInstance: Math.random().toString(),
				},
			],
		}

		super(player1, EVIL_X_BOSS_PLAYER, 'BOSS')

		this.state = getBossState(this)
	}

	public get isBossTurn() {
		return this.state.turn.turnNumber % 2 == 0
	}
}
