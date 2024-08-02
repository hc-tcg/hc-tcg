import {SpeakerIcon} from "components/svgs"
import {setSetting} from "logic/local-settings/local-settings-actions"
import {getSettings} from "logic/local-settings/local-settings-selectors"
import {useDispatch, useSelector} from "react-redux"
import css from "./toolbar.module.scss"

function SoundItem() {
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()

	const handleSoundChange = () => {
		dispatch(setSetting("muted", !settings.muted))
	}

	return (
		<button
			className={css.item}
			title="Mute Sounds (M)"
			onClick={handleSoundChange}
		>
			<SpeakerIcon level={settings.muted ? 0 : 100} />
		</button>
	)
}

export default SoundItem
