import { Enemy } from "../models/enemy"
import { Player } from "../models/player"
import { Character } from "../models/character"




export function reduceCooldowns(character: Character): void{
    if (!character.skills) return

    for(let skill of character.skills){
        if (skill.currentCooldown > 0) skill.currentCooldown -= 1
    }
}

export async function wait(seconds: number): Promise<void>{
    return new Promise((res, rej) => {
        setTimeout(() => {
            res()
        }, seconds * 1000)
    })
}