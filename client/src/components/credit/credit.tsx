import classnames from 'classnames'
import css from './credit.module.scss'

interface Props {
	name: string
	social: string
	handle: string
	link?: string
	avatar: string
}

const Credit = ({name, social, handle, link, avatar}: Props) => {
	const hasLink = link !== undefined
	const content = (
		<>
			<img src={avatar} className={css.avatar} />
			<div>
				<div className={css.name}>{name}</div>
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

export default Credit
