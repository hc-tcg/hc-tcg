import StringEffectCard from './string'
import TurtleShellEffectCard from './turtle-shell'
import ThornsIIEffectCard from './thorns_ii'
import ThornsIIIEffectCard from './thorns_iii'
import ChainmailArmorEffectCard from './chainmail-armor'
import CommandBlockEffectCard from './command-block'
import LightningRodEffectCard from './lightning-rod'
import ArmorStandEffectCard from './armor-stand'
import Card from '../../base/card'

const effectCardClasses: Array<new () => Card> = [
	ArmorStandEffectCard,
	ChainmailArmorEffectCard,
	CommandBlockEffectCard,
	LightningRodEffectCard,
	StringEffectCard,
	ThornsIIEffectCard,
	ThornsIIIEffectCard,
	TurtleShellEffectCard,
]

export default effectCardClasses
