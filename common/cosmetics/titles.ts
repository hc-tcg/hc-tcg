import British from '../achievements/british'
import CertifiedZombie from '../achievements/certified-zombie'
import DefeatEvilX from '../achievements/defeat-evil-x'
import Ethogirl from '../achievements/ethogirl'
import NakedAndScared from '../achievements/naked-and-scared'
import OreSnatcher from '../achievements/ore-snatcher'
import PeskyBird from '../achievements/pesky-bird'
import TeamStar from '../achievements/team-star'
import {
	BalancedWins,
	BuilderWins,
	ExplorerWins,
	FarmWins,
	MinerWins,
	PranksterWins,
	PvpWins,
	RedstoneWins,
	SpeedrunnerWins,
	TerraformWins,
} from '../achievements/type-wins'
import Win from '../achievements/wins'
import {Title} from './types'

const TitleDefinitions: Omit<Title, 'type'>[] = [
	{
		id: 'no_title',
		name: '',
	},
	{
		id: 'british',
		name: "Bri'ish",
		requires: {achievement: British.id},
	},
	{
		id: 'card_slinger',
		name: 'Card Slinger',
		requires: {achievement: Win.id, level: 1},
	},
	{
		id: 'certified-zombie',
		name: 'Certified Zombie',
		requires: {achievement: CertifiedZombie.id},
	},
	{
		id: 'ethogirl',
		name: 'Ethogirl',
		requires: {achievement: Ethogirl.id},
	},
	{
		id: 'evil_xterminator',
		name: 'Evil X-Terminator',
		requires: {achievement: DefeatEvilX.id},
	},
	{
		id: 'hermit_gang',
		name: 'Hermit Gang',
		requires: {achievement: TeamStar.id},
	},
	{
		id: 'naked_and_scared',
		name: 'Naked and Scared',
		requires: {achievement: NakedAndScared.id},
	},
	{
		id: 'victor',
		name: 'Victor',
		requires: {achievement: Win.id, level: 0},
	},
	{
		id: 'ore_snatcher',
		name: 'Ore Snatcher',
		requires: {achievement: OreSnatcher.id},
	},
	{
		id: 'pesky_bird',
		name: 'Pesky Bird',
		requires: {achievement: PeskyBird.id},
	},
	{
		id: 'builder_title',
		name: 'Builder Master',
		requires: {achievement: BuilderWins.id, level: 1},
	},
	{
		id: 'balanced_title',
		name: 'Balanced Master',
		requires: {achievement: BalancedWins.id, level: 1},
	},
	{
		id: 'explorer_title',
		name: 'Explorer Master',
		requires: {achievement: ExplorerWins.id, level: 1},
	},
	{
		id: 'farm_title',
		name: 'Farm Master',
		requires: {achievement: FarmWins.id, level: 1},
	},
	{
		id: 'miner_title',
		name: 'Miner Master',
		requires: {achievement: MinerWins.id, level: 1},
	},
	{
		id: 'prankster_title',
		name: 'Prankster Master',
		requires: {achievement: PranksterWins.id, level: 1},
	},
	{
		id: 'pvp_title',
		name: 'PvP Master',
		requires: {achievement: PvpWins.id, level: 1},
	},
	{
		id: 'redstone_title',
		name: 'Redstone Master',
		requires: {achievement: RedstoneWins.id, level: 1},
	},
	{
		id: 'speedrunner_title',
		name: 'Speedrunner Master',
		requires: {achievement: SpeedrunnerWins.id, level: 1},
	},
	{
		id: 'terraform_title',
		name: 'Terraform Master',
		requires: {achievement: TerraformWins.id, level: 1},
	},
]

export const ALL_TITLES: Title[] = TitleDefinitions.map((title) => ({
	type: 'title',
	...title,
}))

export const TITLES: Record<string | number, Title> = ALL_TITLES.reduce(
	(result: Record<string | number, Title>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
