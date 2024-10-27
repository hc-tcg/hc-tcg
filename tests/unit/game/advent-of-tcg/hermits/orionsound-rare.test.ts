import {describe, expect, test} from '@jest/globals'
import OrionSoundRare from 'common/cards/advent-of-tcg/hermits/orionsound-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Bow from 'common/cards/single-use/bow'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import MelodyEffect from 'common/status-effects/melody'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Oli Melody', () => {
	test('Melody functionality', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Bow,
					InvisibilityPotion,
					InvisibilityPotion,
				],
				playerTwoDeck: [OrionSoundRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, OrionSoundRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(OrionSoundRare.health - EthosLabCommon.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 + 10)
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage,
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							10,
					)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 + 20)
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							20,
					)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						OrionSoundRare.health -
							EthosLabCommon.secondary.damage -
							EthosLabCommon.secondary.damage,
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						OrionSoundRare.health -
							EthosLabCommon.secondary.damage -
							EthosLabCommon.secondary.damage +
							10,
					)
					yield* attack(game, 'primary')
					expect(game.state.pickRequests).toHaveLength(0)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							30,
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow).toBe(null)
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(MelodyEffect),
							query.not(query.effect.targetEntity(null)),
						).length,
					).toBe(0)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
