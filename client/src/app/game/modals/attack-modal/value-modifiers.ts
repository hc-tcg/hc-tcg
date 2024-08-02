const valueModifiers: Array<(states: any, modifier: any) => void> = []

// Invisibility potion
valueModifiers.push((states: any, modifier: any) => {
	const {opponentPlayer} = states

	const custom = opponentPlayer.custom

	if (!custom['invisibility_potion']) return
	const multiplier = custom['invisibility_potion'] === 'heads' ? 0 : 2
	modifier.hermit.multiplier *= multiplier
	modifier.weakness.multiplier *= multiplier
})

// Turtle Shell
valueModifiers.push((states: any, modifier: any) => {
	const {opponentPlayer, singleUseInfo} = states

	const custom = opponentPlayer.custom

	if (!custom['turtle_shell']) return
	if (singleUseInfo?.id === 'golden_axe') return
	modifier.protection.min = -1
	modifier.protection.max = -1
})

// Anvil
valueModifiers.push((states: any, modifier: any) => {
	const {singleUseInfo} = states

	if (singleUseInfo?.id !== 'anvil') return
	modifier.effect.min -= 80
	modifier.effect.max += 0
	modifier.afkEffect.min = 0
})

// Golden axe
valueModifiers.push((states: any, modifier: any) => {
	const {singleUseInfo} = states

	if (singleUseInfo?.id !== 'golden_axe') return
	modifier.protection.multiplier *= 0
})

export default valueModifiers
