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
    value: number
    cooldown: number
    currentCooldown: number
    cost: number
    costType: 'hp' | 'cp'
    type: 'damage' | 'heal' | 'buff' | 'debuff'
    target: 'self' | 'enemy' | 'team' | 'enemyTeam' | 'teamMember'
    selected?: boolean
    effect?: StatusEffect
}

export interface StatusEffect {
    name: string              // Nazwa efektu (np. "Podpalenie", "Ogłuszenie")
    duration: number           // Liczba tur do wygaśnięcia
    value: number
    type: 'damage' | 'heal'
}

export interface HudOPtion {
    name: 'attack' | 'skills'
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