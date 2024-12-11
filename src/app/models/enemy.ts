export interface Enemy {
    name: string
    maxHp: number
    currentHp: number
    baseDmg: number
    speed: number
    performAction: boolean
}
