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
	},
	{
		id: 'balanced',
		name: 'Flowers',
		requires: {achievement: BalancedWins.id},
	},
	{
		id: 'builder',
		name: 'Plains',
		requires: {achievement: BuilderWins.id},
	},
	{
		id: 'explorer',
		name: 'The End',
		requires: {achievement: ExplorerWins.id},
	},
	{
		id: 'farm',
		name: 'Farm',
		requires: {achievement: FarmWins.id},
	},
	{
		id: 'terraform',
		name: 'Azalea',
		requires: {achievement: TerraformWins.id},
	},
	{
		id: 'pvp',
		name: 'Taiga',
		requires: {achievement: PvpWins.id},
	},
	{
		id: 'speedrunner',
		name: 'Stronghold',
		requires: {achievement: SpeedrunnerWins.id},
	},
	{
		id: 'miner',
		name: 'Dripstone',
		requires: {achievement: MinerWins.id},
	},
	{
		id: 'redstone',
		name: 'Desert',
		requires: {achievement: RedstoneWins.id},
	},
	{
		id: 'prankster',
		name: 'Deep Dark',
		requires: {achievement: PranksterWins.id},
	},
	{
		id: 'how_did_we_get_here',
		name: 'The Nether',
		requires: {achievement: HowDidWeGetHere.id},
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
