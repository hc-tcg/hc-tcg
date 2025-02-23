import British from '../achievements/british'
import CertifiedZombie from '../achievements/certified-zombie'
import DefeatEvilX from '../achievements/defeat-evil-x'
import Ethogirl from '../achievements/ethogirl'
import NakedAndScared from '../achievements/naked-and-scared'
import OreSnatcher from '../achievements/ore-snatcher'
import PeskyBird from '../achievements/pesky_bird'
import TeamStar from '../achievements/team-star'
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
	},
	{
		id: 'balanced_title',
		name: 'Balanced Master',
	},
	{
		id: 'explorer_title',
		name: 'Explorer Master',
	},
	{
		id: 'farm_title',
		name: 'Farm Master',
	},
	{
		id: 'miner_title',
		name: 'Miner Master',
	},
	{
		id: 'prankster_title',
		name: 'Prankster Master',
	},
	{
		id: 'pvp_title',
		name: 'PvP Master',
	},
	{
		id: 'redstone_title',
		name: 'Redstone Master',
	},
	{
		id: 'speedrunner_title',
		name: 'Speedrunner Master',
	},
	{
		id: 'terraform_title',
		name: 'Terraform Master',
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
