import { Border } from "./types";

const BorderDefinitions: Omit<Border, 'type'>[] = [
    {
	id: 'blue',
	name: 'Blue',
},
    {
	id: 'green',
	name: 'Emerald',
}
]

export const ALL_BORDERS: Border[] = BorderDefinitions.map((border) => ({type: 'border', ...border}))

export const BORDERS: Record<string | number, Border> = ALL_BORDERS.reduce(
	(result: Record<string | number, Border>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
