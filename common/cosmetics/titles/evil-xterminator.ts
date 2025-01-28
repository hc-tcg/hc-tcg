import DefeatEvilX from "../../achievements/defeat-evil-x";
import { Cosmetic } from "../types";

const EvilXTerminatorTitle: Cosmetic = {
    type: 'title',
    id: 'evil_xterminator',
    name: 'Evil X-Terminator',
    requires: DefeatEvilX.id,
}

export default EvilXTerminatorTitle
