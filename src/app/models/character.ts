export interface Character {
    name: string
    maxHp: number
    currentHp: number
    maxCp: number
    currentCp: number
    baseDmg: number
    speed: number
    critChance: number
    isEnemy: boolean
    skills: Skill[]
    statusEffects: StatusEffect[]
    hpChange?: number
}

export interface Skill {
    name: string
    element: 'fire' | 'water' | 'electric' | 'wind' | 'earth' | 'physical' | 'other'
    value: number
    cooldown: number
    currentCooldown: number
    cost: number
    costType: 'hp' | 'cp'
    type: 'damage' | 'heal' | 'buff' | 'debuff'
    target: 'self' | 'enemy' | 'team' | 'enemyTeam' | 'teamMember'
    hitChance?: number
    selected?: boolean
    effect?: StatusEffect
    effectApplyChance?: number
    spriteAnimationClass?: string;
}

export interface StatusEffect {
    name: string              
    duration: number           
    value: number
    procChance: number
    triggerTiming: 'start' | 'end' 
    type: 'damage' | 'heal' | 'stun'
    onSelf?: boolean
}



export interface Mission {
    id: number
    name: string
    exp: number
    battles: Battle[]
}

export interface Battle {
    enemies: Character[]
}