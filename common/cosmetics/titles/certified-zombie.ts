import CertifiedZombie from '../../achievements/certified-zombie'
import {Title} from '../types'

const CertifiedZombieTitle: Title = {
	type: 'title',
	id: 'certified-zombie',
	name: 'Certified Zombie',
	requires: CertifiedZombie.id,
}

export default CertifiedZombieTitle
