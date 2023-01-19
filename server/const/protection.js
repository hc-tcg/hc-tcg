/* This file is used to get protection values from attached effect cards */
/*
target - amount of damage it protects the target of an attack from
discard - if true, effect is discarded after attack
*/
const PROTECTION = {
	shield: {target: 10, discard: true},
	iron_armor: {target: 20},
	gold_armor: {target: 30, discard: true},
	diamond_armor: {target: 30},
	netherite_armor: {target: 40},
}

export default PROTECTION
