import { useState } from "react";
import css from "./sound-button.module.css";

function SoundButton() {

	const [soundOn, setSoundOn] = useState<boolean>(localStorage.getItem("soundOn") !== "off");

	const handleSoundChange = () => {
		setSoundOn((value) => {
			localStorage.setItem("soundOn", value === true ? "off" : "on")
			return !value
		})
	};

	return (
		<button 
			className={css.soundButton}
			onClick={handleSoundChange}
		>
			<img 
				src={soundOn ? 
					"/images/icons/volume-high-solid.svg" :
					"/images/icons/volume-xmark-solid.svg" 
				}
			/>
		</button>
	)
}

export default SoundButton;
