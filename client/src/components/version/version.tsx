import {CONFIG} from '../../../../config'
import css from './version.module.scss'

const Version = () => {
	return <div className={css.version}>v{CONFIG.version}</div>
}

export default Version
