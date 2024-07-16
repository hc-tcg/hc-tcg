import String from './string'
import TurtleShell from './turtle-shell'
import ThornsII from './thorns_ii'
import ThornsIII from './thorns_iii'
import ChainmailArmor from './chainmail-armor'
import CommandBlock from './command-block'
import LightningRod from './lightning-rod'
import ArmorStand from './armor-stand'
import Card from '../../base/card'

const effectCardClasses: Array<new () => Card> = [
	ArmorStand,
	ChainmailArmor,
	CommandBlock,
	LightningRod,
	String,
	ThornsII,
	ThornsIII,
	TurtleShell,
]

export default effectCardClasses
