import {VirtualAI} from '../../types/virtual-ai'
import ExBossAI from './exboss-ai'

const aiClasses: Array<VirtualAI> = [ExBossAI]

export const AI_DEFINITIONS: Record<string, VirtualAI> = aiClasses.reduce(
	(result: Record<string, VirtualAI>, ai) => {
		result[ai.id] = ai
		return result
	},
	{},
)

export {default as virtualPlayerActionSaga} from './virtual-action'
