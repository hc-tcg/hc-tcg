import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'

class RevivedByDeathloopEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'revived_by_deathloop',
		name: 'Revived',
		description: "This hermit has been revived by Scar's deathloop attack.",
	}
}

export default RevivedByDeathloopEffect
