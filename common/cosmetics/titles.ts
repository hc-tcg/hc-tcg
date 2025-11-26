import British from '../achievements/british'
import CertifiedZombie from '../achievements/certified-zombie'
import RedKing from '../achievements/close-call'
import DefeatEvilX from '../achievements/defeat-evil-x'
import Ethogirl from '../achievements/ethogirl'
import GodsFavoritePrincess from '../achievements/gods-favorite-princess'
import IsGreat from '../achievements/is-great'
import MasterOfPuppets from '../achievements/master-of-puppets'
import NakedAndScared from '../achievements/naked-and-scared'
import NewTeamCanada from '../achievements/new-team-canada'
import OreSnatcher from '../achievements/ore-snatcher'
import PeskyBird from '../achievements/pesky-bird'
import PoePoeEnforcer from '../achievements/poe-poe-enforcer'
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
import WashedUp from '../achievements/washed-up'
import Win from '../achievements/wins'
import WorldEater from '../achievements/world-eater'
import {Title} from './types'

const TitleDefinitions: Omit<Title, 'type'>[] = [
	{
		id: 'no_title',
		name: 'No Title',
	},
	{
		id: 'british',
		name: "Bri'ish",
		requires: {achievement: British.id},
	},
	{
		id: 'card_slinger',
		name: 'Card Slinger',
		requires: {achievement: Win.id, level: 0},
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
		id: 'gods_favorite_princess',
		name: "God's Favorite Princess",
		requires: {achievement: GodsFavoritePrincess.id},
	},
	{
		id: 'hermit_gang',
		name: 'Hermit Gang',
		requires: {achievement: TeamStar.id},
	},
	{
		id: 'is_great',
		name: '...is Great',
		requires: {achievement: IsGreat.id},
	},
	{
		id: 'master_of_puppets',
		name: 'Master of Puppets',
		requires: {achievement: MasterOfPuppets.id},
	},
	{
		id: 'naked_and_scared',
		name: 'Naked and Scared',
		requires: {achievement: NakedAndScared.id},
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
		id: 'poe_poe_enforcer',
		name: 'Poe Poe Enforcer',
		requires: {achievement: PoePoeEnforcer.id},
	},
	{
		id: 'red_king',
		name: 'Red king',
		requires: {achievement: RedKing.id},
	},
	{
		id: 'team_canada',
		name: 'Team Canada',
		requires: {achievement: NewTeamCanada.id},
	},
	{
		id: 'washed_up',
		name: 'Washed Up',
		requires: {achievement: WashedUp.id},
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
	{
		id: 'world_eater',
		name: 'World Eater',
		requires: {achievement: WorldEater.id},
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
