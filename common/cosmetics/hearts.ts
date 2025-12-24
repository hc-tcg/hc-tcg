import CantTouchThis from '../achievements/cant-touch-this'
import Channeling from '../achievements/channeling'
import DeckedOut from '../achievements/decked-out'
import Demise from '../achievements/demise'
import DoubleEmerald from '../achievements/double-emerald'
import FullySaturated from '../achievements/fully-saturated'
import iBuy from '../achievements/ibuy'
import PistonExtender from '../achievements/piston-extender'
import SpaceRace from '../achievements/space-race'
import {PotionDecks} from '../achievements/su-decks'
import SUStainable from '../achievements/sustainable'
import TurtleMaster from '../achievements/turtle-master'
import UltraHardcore from '../achievements/ultra-hardcore'
import UseLikeAHermit from '../achievements/use-like-a-hermit'
import Win from '../achievements/wins'
import {Heart} from './types'

const HeartDefinitions: Omit<Heart, 'type'>[] = [
	{
		id: 'red',
		name: 'Default',
	},
	{
		id: 'amethyst',
		name: 'Amethyst',
		requires: {achievement: Demise.id},
	},
	{
		id: 'blue_terracotta',
		name: 'Blue G.T.',
		requires: {achievement: TurtleMaster.id},
	},
	{
		id: 'copper',
		name: 'Copper',
		requires: {achievement: Channeling.id},
	},
	{
		id: 'emerald',
		name: 'Emerald',
		requires: {achievement: DoubleEmerald.id},
	},
	{
		id: 'ender',
		name: 'Ender Pearl',
		requires: {achievement: SpaceRace.id},
	},
	{
		id: 'plant',
		name: 'Flower',
		requires: {achievement: SUStainable.id},
	},
	{
		id: 'gold',
		name: 'Gold',
		requires: {achievement: Win.id, level: 4},
	},
	{
		id: 'hardcore',
		name: 'Hardcore',
		requires: {achievement: UltraHardcore.id},
	},
	{
		id: 'honeycomb',
		name: 'Honeycomb',
		requires: undefined,
	},
	{
		id: 'hunger',
		name: 'Haunch',
		offVariantName: 'hunger_empty',
		requires: {achievement: FullySaturated.id},
	},
	{
		id: 'wooden',
		name: 'Heart Stand',
		offVariantName: 'wooden_empty',
		requires: {achievement: UseLikeAHermit.id},
	},
	{
		id: 'lamp',
		name: 'Lamp',
		offVariantName: 'lamp_off',
		requires: {achievement: iBuy.id},
	},
	{
		id: 'magenta',
		name: 'Magenta G.T.',
		requires: undefined,
	},
	{
		id: 'potion',
		name: 'Potion',
		offVariantName: 'potion_empty',
		requires: {achievement: PotionDecks.id},
	},
	{
		id: 'quartz',
		name: 'Quartz',
		requires: undefined,
	},
	{
		id: 'silver_heart',
		name: 'Silver',
		requires: {achievement: CantTouchThis.id},
	},
	{
		id: 'soulflame',
		name: 'Soulflame',
		requires: {achievement: DeckedOut.id},
	},
	{
		id: 'slime_hearts',
		name: 'Slime',
		requires: {achievement: PistonExtender.id},
	},
	{
		id: 'web',
		name: 'Web',
		requires: undefined,
	},
]

export const ALL_HEARTS: Heart[] = HeartDefinitions.map((heart) => ({
	type: 'heart',
	...heart,
}))

export const HEARTS: Record<string | number, Heart> = ALL_HEARTS.reduce(
	(result: Record<string | number, Heart>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
