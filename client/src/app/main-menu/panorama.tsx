import React from 'react'
import * as THREE from 'three'
import css from './panorama.module.scss'
import {OrbitControls} from '@react-three/drei'
import {Canvas, useThree} from '@react-three/fiber'

// extend({OrbitControls})

type Props = {
	panorama: 'hermit-hill' | 'town-hall'
}

const SkyBox = ({panorama}: Props) => {
	const {scene} = useThree()
	const loader = new THREE.CubeTextureLoader()
	const texture = loader.load([
		`/images/panorama/${panorama}/panorama_1.png`, //Left
		`/images/panorama/${panorama}/panorama_3.png`, //Right
		`/images/panorama/${panorama}/panorama_4.png`, //Top
		`/images/panorama/${panorama}/panorama_5.png`, //Bottom
		`/images/panorama/${panorama}/panorama_2.png`, //Back
		`/images/panorama/${panorama}/panorama_0.png`, //Front
	])

	console.log('Texture: ', texture)

	scene.background = texture
	scene.backgroundIntensity = 0.9
	return null
}

const Panorama = ({panorama}: Props) => {
	console.log('Rendering panorama...')
	return (
		<Canvas linear flat className={css.canvas}>
			<OrbitControls autoRotate autoRotateSpeed={0.07} />
			<SkyBox panorama={panorama} />
		</Canvas>
	)
}

export default React.memo(Panorama)
