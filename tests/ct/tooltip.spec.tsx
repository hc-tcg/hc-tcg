import {expect, test} from '@playwright/experimental-ct-react'
import StatusEffectTooltip from 'client/components/status-effects/status-effect-tooltip'
import {CardEntity, PlayerEntity} from 'common/entities'
import {AussiePingEffect} from 'common/status-effects/aussie-ping'
import SleepingEffect from 'common/status-effects/sleeping'
import {WithoutFunctions} from 'common/types/server-requests'

test('Status Effect Tooltip Hermit', async ({mount}) => {
	const component = await mount(
		<StatusEffectTooltip
			statusEffect={{
				props: WithoutFunctions(SleepingEffect),
				instance: 'anything is okay here',
				target: {
					type: 'card',
					card: 'anything is okay here' as CardEntity,
				},
				counter: null,
				description: SleepingEffect.description,
			}}
			counter={null}
		/>,
	)
	await expect(component).toHaveScreenshot()
})

test('Status Effect Tooltip Global', async ({mount}) => {
	const component = await mount(
		<StatusEffectTooltip
			statusEffect={{
				props: WithoutFunctions(AussiePingEffect),
				instance: 'anything is okay here',
				target: {
					type: 'global',
					player: 'anything is okay here' as PlayerEntity,
				},
				counter: null,
				description: AussiePingEffect.description,
			}}
			counter={null}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
