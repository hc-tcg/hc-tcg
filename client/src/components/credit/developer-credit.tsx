import css from './credit.module.scss'
import classnames from 'classnames'
import Tooltip from 'components/tooltip'

interface Props {
	name: string
	social: string
	handle: string
	link?: string
	avatar: string
}

const DeveloperCredit = ({name, social, handle, link, avatar}: Props) => {
	let nameTooltip = (
		<div className={css.tooltip}>
			<div className={css.name}>{name}</div>
			<div className={css.handle}>
				<img
					src={`images/icons/${social}.svg`}
					className={classnames(css.handle, css.handleImage)}
				/>
				{handle}
			</div>
		</div>
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
