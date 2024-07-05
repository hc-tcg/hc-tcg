import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'

class RevivedByDeathloopStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'revived-by-deathloop',
		name: 'Revived',
		description: "This hermit has been revived by Scar's deathloop attack.",
	}
}

export default RevivedByDeathloopStatusEffect
