import css from './credit.module.scss'
import classnames from 'classnames'

interface Props {
	name: string
	social: string
	handle: string
	link?: string
	avatar: string
}

const Credits = ({name, social, handle, link, avatar}: Props) => {
	const hasLink = link !== undefined
	const content = (
		<>
			<img src={avatar} className={css.avatar} />
			<div>
				<div>{name}</div>
				<div className={css.handle}>
					<img
						src={`images/icons/${social}.svg`}
						className={classnames(css.handle, css.handleImage)}
					/>
					{handle}
				</div>
			</div>
		</>
	)

	return hasLink ? (
		<a className={css.credit} href={link} target="_blank" rel="noreferrer">
			{content}
		</a>
	) : (
		<div className={css.credit}> {content} </div>
	)
}

export default Credits
