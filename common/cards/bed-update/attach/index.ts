import {Card} from '../../types'
import CorruptionBed from './corruption-bed'
import HealthyBed from './healthy-bed'
import RealisticBed from './realistic-bed'
import PowerBed from './power-bed'
import ReallySleepyBed from './really-sleepy-bed'
import ReallyHealthyBed from './really-health-bed'
import ThievingBed from './thieving-bed'
import BouncyBed from './bouncy-bed'

const effectCardClasses: Array<Card> = [
	PowerBed,
	ReallySleepyBed,
	HealthyBed,
	RealisticBed,
	ReallyHealthyBed,
	CorruptionBed,
	ThievingBed,
	BouncyBed,
]

export default effectCardClasses
