import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Enemy } from '../models/enemy';
import { Player } from '../models/player';
import { Character, Skill, Battle } from '../models/character';

import { reduceCooldowns, wait } from '../utils/battle.utils';
import { GameService } from '../services/battleService.service';
import { GameState } from '../models/gameState';
import { BattleCharacterComponent } from '../battle-character/battle-character.component';
import { ActionHudComponent } from '../action-hud/action-hud.component';



@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule, BattleCharacterComponent, ActionHudComponent],
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.css'
})
export class BattleComponent {
  @Input() allies! : Character[]
  @Input() battles! : Battle[]

  GameState = GameState
  // battles: Battle[] = []
  battleIndex: number = 0

  // allies: Character[] = [];
  enemies: Character[] = [];


  turnOrder: Character[] = []
  turnIndex = -1

  displayedTurnOrder: Character[] = []

  selectedSkill: Skill | null = null

  chosenAction: string | null = null
  chosenSkill: Skill | null = null;
  target: Character | null = null


  gameStateSub: any
  skillSub: any
  actionSub: any

  

  constructor(private router: Router, public gameService: GameService) {
    // console.log(this.alliesInput)
    // console.log(this.battlesInput)

    
    // this.allies = this.alliesInput
      
    //   this.battles = this.battlesInput
    //   this.battles = this.battles.map((battle) => ({
    //     ...battle,
    //     enemies: battle.enemies.map((enemy) => ({
    //       ...enemy,
    //       currentHp: enemy.maxHp,
    //       currentCp: 0,
    //       maxCp: 0,
    //       isEnemy: true,
    //       statusEffects: [],
    //       skills: enemy.skills.map( (skill) => ({
    //         ...skill,
    //         currentCooldown: 0
    //       }))
    //     }))
    //   }))
      
    //   this.enemies = this.battles[this.battleIndex].enemies

    //   this.turnOrder = [...this.enemies, ...this.allies].sort((a, b) => b.speed - a.speed)
    //   this.displayedTurnOrder = this.turnOrder

    
  }

  ngOnInit(): void{
    // if(!this.state) {
    //   console.log("no state")
    //   this.router.navigate(['/missions'])
    // }

    // console.log(this.alliesInput)
    // console.log(this.battlesInput)
    
    // this.allies = this.alliesInput

    this.battles = this.battles
      this.battles = this.battles.map((battle) => ({
        ...battle,
        enemies: battle.enemies.map((enemy) => ({
          ...enemy,
          currentHp: enemy.maxHp,
          currentCp: 0,
          maxCp: 0,
          isEnemy: true,
          statusEffects: [],
          skills: enemy.skills.map( (skill) => ({
            ...skill,
            currentCooldown: 0
          }))
        }))
      }))
      
      this.enemies = this.battles[this.battleIndex].enemies

      this.turnOrder = [...this.enemies, ...this.allies].sort((a, b) => b.speed - a.speed)
      this.displayedTurnOrder = this.turnOrder
    


    this.gameStateSub = this.gameService.state$.subscribe((state) => {
      this.handleState(state);
    })

    this.skillSub = this.gameService.skill$.subscribe((skill) => {
      this.chosenSkill = skill;
    })

    this.actionSub = this.gameService.action$.subscribe((action) => {
      this.chosenAction = action
      // console.log("action: ", action)
    })
    
  }

  ngOnDestroy(){
    console.log("skibidi sigma")
    this.gameStateSub.unsubscribe()
    this.actionSub.unsubscribe()
    this.skillSub.unsubscribe()
  }

  handleState(state: GameState): void {
    switch (state) {
      case GameState.CheckBattleOver:
        this.checkBattleOver()
        break
      case GameState.ChooseNextCharacter:
        this.chooseNextCharacter()
        break
      case GameState.ApplyStartStatusEffects:
        this.applyStartStatusEffects()
        break
      case GameState.ChooseAction:
        this.chooseAction()
        break
      case GameState.ExecuteAction:
        this.executeAction()
        break
      case GameState.ApplyEndStatusEffects:
        this.applyEndStatusEffects()
        break
    }
  }

  checkBattleOver(): void {
    console.log('STATE - check battle over')
    // Logic to check if the battle is over
    const isOver = this.isBattleFinished()
    if (isOver) {
      this.handleFinishedBattle()
    } else {
      this.gameService.setState(GameState.ChooseNextCharacter);
    }
  }

  chooseNextCharacter(): void {
    console.log('STATE - choose next character turn')

    do {
      this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    } while (this.currentTurn.currentHp <= 0)

    console.log("   ", this.currentTurn.name)

    this.updateDisplayedTurnOrder(this.turnOrder)
    this.selectedSkill = null
    reduceCooldowns(this.currentTurn)

    this.gameService.setState(GameState.ApplyStartStatusEffects);
  }

  async applyStartStatusEffects(): Promise<void> {
    console.log('STATE - apply start status')
    // Logic to apply status effects

    let isStunned = await this.processStatusEffects(this.currentTurn, 'start')

    // console.log("stuned?: ", isStunned)

    if(isStunned) this.gameService.setState(GameState.ApplyEndStatusEffects)
    else this.gameService.setState(GameState.ChooseAction)

    
  }

  async applyEndStatusEffects(): Promise<void> {
    console.log('STATE - apply end status')
    // Logic to apply status effects

    await this.processStatusEffects(this.currentTurn, 'end')

    this.gameService.setState(GameState.CheckBattleOver);
  }

  chooseAction(): void {
    console.log('STATE - choose action')
    // if player - return from this function
    if(!this.currentTurn.isEnemy) return

    //enemy actions
    let skill = this.currentTurn.skills.find( s => s.currentCooldown === 0)

    if(!skill){
      const target = this.allies.find((ally) => ally.currentHp > 0)
      this.target = target!
      this.gameService.chooseAction('Weapon attack')
      // this.chosenAction = 'Weapon attack'
      // this.weaponAttack(target!)
      
    }
    else if(skill.type === 'damage') {
      if (skill.target === 'enemy' || skill.target === 'enemyTeam') {
        const target = this.allies.find((ally) => ally.currentHp > 0)
        // this.chosenSkill = skill
        this.gameService.chooseAction('Skills')
        this.gameService.chooseSkill(skill)
        this.target = target!
        
      }
    }

    this.gameService.setState(GameState.ExecuteAction)
  }

  async executeAction(): Promise<void> {
    console.log('STATE - execute action')

    console.log('Skill:', this.chosenSkill)
    console.log('Action:', this.chosenAction)
    console.log('Target:', this.target)

    let skill = this.chosenSkill
    let target = this.target

    if (this.chosenAction === 'Meditate') this.recoverCp(this.currentTurn, Math.floor(this.currentTurn.maxCp * 0.5))

    if(target === null) {
      console.log("No target")
      return 
    }

    

    if (this.chosenAction === 'Weapon attack') this.weaponAttack(target)

    // if (this.chosenAction === 'Meditate') this.recoverCp(this.currentTurn, Math.floor(this.currentTurn.maxCp * 0.2))

    if (this.chosenAction === 'Skills' && skill) {

      if (skill.target === 'enemy') this.useSkill([target], skill)

      if (skill.target === 'enemyTeam') this.useSkill(this.aliveEnemies, skill)
  
      if (skill.target === 'self' || skill.target === 'teamMember' ) this.useSkill([target], skill)
  
      if (skill.target === 'team') this.useSkill(this.aliveAllies, skill)
    }


    

    await wait(1.3)
    this.gameService.clearAction()
    this.gameService.clearSkill()
    this.gameService.setState(GameState.ApplyEndStatusEffects);
  }

  get currentTurn(): Character {
    return this.turnOrder[this.turnIndex];
  }
  
  get aliveEnemies(): Character[]{
    return this.enemies.filter(e => e.currentHp > 0) || []
  }
  get aliveAllies(): Character[]{
    return this.allies.filter(e => e.currentHp > 0) || []
  }

  onTargetSelected(target: any): void {

    this.target = target
    this.gameService.setState(GameState.ExecuteAction);
  }



  

  heal(target: Character, value: number) : void{
    target.currentHp = Math.min(target.currentHp + value, target.maxHp)
  }
  recoverCp(target: Character, value: number): void {
    target.currentCp = Math.min(target.currentCp + value, target.maxCp)
  }

  useSkill(targets: Character[], skill: Skill): void {
    skill.currentCooldown = skill.cooldown

    if ( skill.costType === 'cp') this.currentTurn.currentCp -= skill.cost
    if ( skill.costType === 'hp') this.dealDamage(this.currentTurn, skill.cost)

    if (skill.hitChance) {
      let hit = Math.random() * 100 < skill.hitChance
      if (hit) {
        console.log('skill missed')
        return
      }
    }

    if(skill.type === 'damage') {
      let isCriticalHit = Math.random() * 100 < this.currentTurn.critChance;
      for ( let target of targets) this.dealDamage(target, skill.value, isCriticalHit ? 100 : 0) 
    }

    if(skill.type === 'heal') {
      for ( let target of targets) this.heal(target, skill.value)
      
    }

    if(!skill.effect) return

    if(skill.effect.onSelf) this.applyEffectOnTarget(this.currentTurn, skill)    
    else
      for ( let target of targets) this.applyEffectOnTarget(target, skill)

    
  }

  dealDamage(target: Character, value: number, critChance: number = 0): Promise<void> {
    return new Promise(async (res, rej) => {

      let isCriticalHit = Math.random() * 100 < critChance;
      let finalDamage = isCriticalHit ? Math.floor(value * 1.5) : value

      target.hpChange = finalDamage
      target.currentHp = Math.max(target.currentHp - finalDamage, 0)

      if(target.currentHp <= 0){
        // target.statusEffects = []
        // this.nextTurn()
      }

      await wait(1)

      res()
    })
    
  }

  weaponAttack(target: Character) {
    // console.log(this.currentTurn.name, ' recovers CP')
    this.recoverCp(this.currentTurn, Math.floor(this.currentTurn.maxCp * 0.2))
    this.dealDamage(target, this.currentTurn.baseDmg, this.currentTurn.critChance)  
  }

  applyEffectOnTarget(target: Character, skill: Skill){
    if(!skill.effectApplyChance) target.statusEffects.push(structuredClone(skill.effect!))
    
    let applied = Math.random() * 100 < skill.effectApplyChance!

    if(applied) target.statusEffects.push(structuredClone(skill.effect!))
  }
  
  processStatusEffects(character: Character, trigerTime: 'start' | 'end'): Promise<boolean> {
    return new Promise(async (res, rej) => {
      let isStunned: boolean = false
      
      // console.log(character.statusEffects)

      for (const effect of character.statusEffects) {
        if (effect.triggerTiming !== trigerTime) continue

        if (effect.type === 'damage') await this.dealDamage(character, effect.value)
        if (effect.type === 'heal') await this.heal(character, effect.value)
        if (effect.type === 'stun') {
          let proc = Math.random() * 100 < effect.procChance
          if (proc) isStunned = true
        }

        effect.duration--
    
        if (effect.duration <= 0) {
          character.statusEffects = character.statusEffects.filter(effect => effect.duration > 0)
        }
        await wait(1)
      }
      
      
      res(isStunned)
    })
    
  }

  isBattleFinished(): boolean {
    if (this.enemies.every((enemy) => enemy.currentHp <= 0)) return true
    if (this.allies.every((ally) => ally.currentHp <= 0)) return true
    return false
  }
  getHpBarWidth(character: Character): number{
    return (character.currentHp / character.maxHp) * 100
  }
  getCpBarWidth(character: Character): number{
    return (character.currentCp / character.maxCp) * 100
  }
  refreshComponent():void {
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //   console.log('refresh====================')
    //   this.router.navigate([this.router.url])
    // })
    // this.router.navigate(['/missions'])
  }
  updateDisplayedTurnOrder(turnOrder: Character[]): void{
    let tmp = turnOrder
    
    const before = tmp.slice(0, this.turnIndex)
    const after = tmp.slice(this.turnIndex)

    tmp = [...after, ...before]
    tmp = tmp.filter(character => character.currentHp > 0)
    this.displayedTurnOrder = tmp
  }

  handleFinishedBattle(): void{
    let isPlayerWin = false
    if (this.enemies.every((enemy) => enemy.currentHp <= 0)) isPlayerWin=true
    if (this.allies.every((ally) => ally.currentHp <= 0)) isPlayerWin=false

    if(isPlayerWin){
      this.battleIndex += 1
      if(this.battles[this.battleIndex]) {
        this.enemies = this.battles[this.battleIndex].enemies

        this.turnOrder = [...this.enemies, ...this.allies].sort((a, b) => b.speed - a.speed)
        this.displayedTurnOrder = this.turnOrder

        this.turnIndex = -1

        this.gameService.setState(GameState.CheckBattleOver)

      } else {
        console.log('u win')
        this.refreshComponent()
      }
    } else {
      console.log('u lost')
      this.refreshComponent()
    }
  }

  

  
}
