import {expect, test} from '@playwright/experimental-ct-react'
import StatusEffectTooltip from 'client/components/status-effects/status-effect-tooltip'
import {TooltipTestContainer} from 'client/components/tooltip/tooltip'
import {CardEntity, PlayerEntity} from 'common/entities'
import {AussiePingEffect} from 'common/status-effects/aussie-ping'
import SleepingEffect from 'common/status-effects/sleeping'

test('Status Effect Tooltip Hermit', async ({mount}) => {
	const component = await mount(
		<TooltipTestContainer>
			<StatusEffectTooltip
				statusEffect={{
					id: SleepingEffect.id,
					instance: 'anything is okay here',
					target: {
						type: 'card',
						card: 'anything is okay here' as CardEntity,
					},
					counter: 1,
					description: SleepingEffect.description,
				}}
				counter={1}
			/>
		</TooltipTestContainer>,
	)
	await expect(component).toHaveScreenshot()
})

test('Status Effect Tooltip Global', async ({mount}) => {
	const component = await mount(
		<TooltipTestContainer>
			<StatusEffectTooltip
				statusEffect={{
					id: AussiePingEffect.id,
					instance: 'anything is okay here',
					target: {
						type: 'global',
						player: 'anything is okay here' as PlayerEntity,
					},
					counter: null,
					description: AussiePingEffect.description,
				}}
				counter={null}
			/>
		</TooltipTestContainer>,
	)
	await expect(component).toHaveScreenshot()
})
