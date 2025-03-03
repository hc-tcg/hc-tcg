import classnames from 'classnames'
import css from './credit.module.scss'

type Social = 'discord' | 'github' | 'gitlab' | 'twitter'

export interface CreditProps {
	name: string
	social: Social
	handle: string
	link?: string
	avatar: string
}

const Credit = ({props}: {props: CreditProps}) => {
	const {name, social, handle, link, avatar} = props
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
