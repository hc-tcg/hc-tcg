import HowDidWeGetHere from '../achievements/how-did-we-get-here'
import AllCards from '../achievements/jack-of-all-cards'
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
import {Background} from './types'

const BackgroundDefinitions: Omit<Background, 'type'>[] = [
	{
		id: 'transparent',
		name: 'Default',
	},
	{
		id: 'classic',
		name: 'Classic',
		requires: {achievement: AllCards.id},
		preview: 'classic_preview',
	},
	{
		id: 'dirt',
		name: 'Dirt',
		requires: undefined,
	},
	{
		id: 'gravel',
		name: 'Gravel',
		requires: undefined,
	},
	{
		id: 'balanced',
		name: 'Flowers',
		requires: {achievement: BalancedWins.id, level: 0},
	},
	{
		id: 'builder',
		name: 'Plains',
		requires: {achievement: BuilderWins.id, level: 0},
	},
	{
		id: 'explorer',
		name: 'The End',
		requires: {achievement: ExplorerWins.id, level: 0},
	},
	{
		id: 'farm',
		name: 'Farm',
		requires: {achievement: FarmWins.id, level: 0},
	},
	{
		id: 'terraform',
		name: 'Azalea',
		requires: {achievement: TerraformWins.id, level: 0},
	},
	{
		id: 'pvp',
		name: 'Taiga',
		requires: {achievement: PvpWins.id, level: 0},
	},
	{
		id: 'speedrunner',
		name: 'Stronghold',
		requires: {achievement: SpeedrunnerWins.id, level: 0},
	},
	{
		id: 'miner',
		name: 'Dripstone',
		requires: {achievement: MinerWins.id, level: 0},
	},
	{
		id: 'redstone',
		name: 'Desert',
		requires: {achievement: RedstoneWins.id, level: 0},
	},
	{
		id: 'prankster',
		name: 'Deep Dark',
		requires: {achievement: PranksterWins.id, level: 0},
	},
	{
		id: 'how_did_we_get_here',
		name: 'The Nether',
		requires: {achievement: HowDidWeGetHere.id, level: 0},
	},
]

export const ALL_BACKGROUNDS: Background[] = BackgroundDefinitions.map(
	(background) => ({type: 'background', ...background}),
)

export const BACKGROUNDS: Record<string | number, Background> =
	ALL_BACKGROUNDS.reduce(
		(result: Record<string | number, Background>, card) => {
			result[card.id] = card
			return result
		},
		{},
	)
