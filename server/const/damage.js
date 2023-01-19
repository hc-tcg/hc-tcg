/* This file is used to get damage values from single_use effect cards */
/*
target - damage to opposing active hermit
afkTarget - damage to opposing afk hermit of choice
self - damage to the hermit that is attacking
*/
const DAMAGE = {
	iron_sword: {target: 20},
	diamond_sword: {target: 40},
	netherite_sword: {target: 60},
	tnt: {target: 60, self: 20},
	bow: {afkTarget: 40},
	crossbow: {target: 40, afkTarget: 10},
	golden_axe: {target: 40},
}

export default DAMAGE
