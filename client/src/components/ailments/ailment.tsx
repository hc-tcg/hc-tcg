import cn from 'classnames'
import css from './ailment.module.scss'
import Tooltip from 'components/tooltip'
import AilmentTooltip from './ailment-tooltip'
import AilmentClass from 'common/ailments/ailment'

interface AilmentProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	ailment: AilmentClass
    duration?: number | undefined
}

const Ailment = (props: AilmentProps) => {
	const {id, damageEffect} = props.ailment

    const extension = ["sleeping", "poison", "fire"].includes(id) ? ".gif" : ".png"
    const ailmentClass = damageEffect == true ? css.damageAilment : css.ailment

	return (
		<Tooltip tooltip={<AilmentTooltip ailment={props.ailment} duration={props.duration}/>}>
            <div>
                <img className={ailmentClass} src={"/images/status/" + id + extension}></img>
                <p className={css.durationIndicator}>{props.duration ? props.duration : "∞"}</p>
            </div>
		</Tooltip>
	)
}

export default Ailment