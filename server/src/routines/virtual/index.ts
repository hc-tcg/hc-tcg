import {AIClass, VirtualAI} from 'common/types/virtual-ai'
import ExBossAI from './exboss-ai'

const aiClasses: Array<AIClass> = [ExBossAI]

export const AI_CLASSES: Record<string, VirtualAI> = aiClasses.reduce(
	(result: Record<string, VirtualAI>, aiClass) => {
		let ai = new aiClass()
		result[aiClass.name] = ai
		result[ai.id] = ai
		return result
	},
	{},
)

export {default as virtualPlayerActionSaga} from './virtual-action'
