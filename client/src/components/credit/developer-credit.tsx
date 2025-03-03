import classnames from 'classnames'
import Tooltip from 'components/tooltip'
import {CreditProps} from './credit'
import css from './credit.module.scss'

const DeveloperCredit = ({props}: {props: CreditProps}) => {
	const {name, social, handle, link, avatar} = props
	let nameTooltip = (
		<>
			<div className={css.name}>{name}</div>
			<div className={css.handle}>
				<img
					src={`images/icons/${social}.svg`}
					className={classnames(css.handle, css.handleImage)}
				/>
				{handle}
			</div>
		</>
	)

	return (
		<div className={css.developerCredit}>
			<a href={link} target="_blank">
				<Tooltip tooltip={nameTooltip}>
					<div>
						<img src={avatar} className={css.avatar} />
					</div>
				</Tooltip>
			</a>
		</div>
	)
}

export default DeveloperCredit
