import { CARDS_LIST } from "../cards";
import { achievement } from "./defaults";
import { Achievement } from "./types";

const AllCards: Achievement = {
    ...achievement,
    id: 'all_cards',
    numericId: 0,
    name: '',
    description: '',
    steps: CARDS_LIST.length,
}