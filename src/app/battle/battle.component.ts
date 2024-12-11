import { ChangeDetectorRef, Component, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Enemy } from '../models/enemy';
import { Player } from '../models/player';
import { Character, HudOPtion, Skill, Battle } from '../models/character';

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
  GameState = GameState
  battles: Battle[] = []
  battleIndex: number = 0

  allies: Character[] = [];
  enemies: Character[] = [];


  turnOrder: Character[] = []
  turnIndex = -1

  displayedTurnOrder: Character[] = []

  activeSkillIndex = 0
  selectedSkill: Skill | null = null

  chosenSkill: Skill | null = null;
  target: Character | null = null

  hudOptions: string[] = ['skills', 'attack']
  activeHudOption: string = this.hudOptions[0]

  playerDamageNumbers: number[][] = []
  enemyDamageNumbers: number[][] = []

  playerHealNumbers: number[][] = []
  enemyHealNumbers: number[][] = []

  blinkTargets: Set<Character> = new Set()

  constructor(private router: Router, public gameService: GameService, private cdr: ChangeDetectorRef) {
    const navigation = this.router.getCurrentNavigation()
    const state = navigation?.extras.state as { allies: Character[], battles: Battle[] }

    if (state){
      this.allies = state.allies
      
      this.battles = state.battles
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

      this.playerDamageNumbers = this.allies.map(() => [])
      this.playerHealNumbers = this.allies.map(() => [])

      this.enemyDamageNumbers = this.enemies.map(() => [])
      this.enemyHealNumbers = this.enemies.map(() => [])

    } else {
      //No data passed to the Battle component. Redirecting to Missions.
      console.log('No data passed to the Battle component. Redirecting to Missions.')
      this.router.navigate(['/missions'])
    }
  }

  ngOnInit(): void{
    this.gameService.state$.subscribe((state) => {
      this.handleState(state);
    })

    this.gameService.skill$.subscribe((skill) => {
      this.chosenSkill = skill;
    })
    
  }

  handleState(state: GameState): void {
    switch (state) {
      case GameState.CheckBattleOver:
        this.checkBattleOver()
        break
      case GameState.ChooseNextCharacter:
        this.chooseNextCharacter()
        break
      case GameState.ApplyStatusEffects:
        this.applyStatusEffects()
        break
      case GameState.ChooseAction:
        this.chooseAction()
        break
      case GameState.ExecuteAction:
        this.executeAction()
        break
    }
  }

  checkBattleOver(): void {
    console.log('STATE - check battle over')
    // Logic to check if the battle is over
    const isOver = false; // Replace with actual logic
    if (isOver) {
      alert('Battle Over!');
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

    this.gameService.setState(GameState.ApplyStatusEffects);
  }

  applyStatusEffects(): void {
    console.log('STATE - apply status')
    // Logic to apply status effects
    this.gameService.setState(GameState.ChooseAction);
  }

  chooseAction(): void {
    console.log('STATE - choose action')
    // Display UI for choosing an action
    if(!this.currentTurn.isEnemy) return

    let skill = this.currentTurn.skills.find( s => s.currentCooldown === 0)

    if(!skill){
      return
    }

    if(skill.type === 'damage') {
      if (skill.target === 'enemy' || skill.target === 'enemyTeam') {
        const target = this.allies.find((ally) => ally.currentHp > 0)
        this.chosenSkill = skill
        this.target = target!
        
      }
    }

    this.gameService.setState(GameState.ExecuteAction)
  }

  async executeAction(): Promise<void> {
    console.log('STATE - execute action')
    // Logic to execute the chosen action

    console.log('Skill:', this.chosenSkill)
    console.log('Target:', this.target)

    if(this.chosenSkill === null || this.target === null) {
      console.log("No target or skill")
      return 
    }

    let skill = this.chosenSkill
    let target = this.target

    if (skill.target === 'enemy') this.useSkill([target], skill)

    if (skill.target === 'enemyTeam') this.useSkill(this.aliveEnemies, skill)

    if (skill.target === 'self' || skill.target === 'teamMember' ) this.useSkill([target], skill)

    if (skill.target === 'team') this.useSkill(this.aliveAllies, skill)

    await wait(1)
    this.gameService.setState(GameState.CheckBattleOver);
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
    console.log('Skill:', this.chosenSkill);
    console.log('Target:', target);

    this.target = target

    this.gameService.setState(GameState.ExecuteAction);
  }


  async nextTurn(): Promise<void> {

    if (this.isBattleFinished()){
      console.log('battle is finished')
      if(this.aliveEnemies.length === 0) {
        this.battleIndex += 1
        console.log(this.battles[this.battleIndex])
        if(this.battles[this.battleIndex]){
          this.enemies = this.battles[this.battleIndex].enemies
          this.turnOrder = [...this.enemies, ...this.allies].sort((a, b) => b.speed - a.speed)
          this.displayedTurnOrder = this.turnOrder
          this.turnIndex = -1

          this.enemyDamageNumbers = this.enemies.map(() => [])
          this.enemyHealNumbers = this.enemies.map(() => [])

          this.nextTurn()
        }
      } else {
        // this.refreshComponent()
        return;
      }
      
    }
    
    do {
      this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    } while (this.currentTurn.currentHp <= 0)

    this.updateDisplayedTurnOrder(this.turnOrder)
    reduceCooldowns(this.currentTurn)

    await this.processStatusEffects(this.currentTurn)
    // if(this.currentTurn.currentHp <= 0){
    //   this.currentTurn.statusEffects = []
    //   this.nextTurn()
    //   return
    // }
    
    if (!this.currentTurn.isEnemy) {
      
      
      this.selectedSkill = null
      

      console.log(`It's ${this.currentTurn.name}'s turn. Choose an action.`)
      
      
    } else {
      // @TODO: enemy action - move to separate function
      this.setActiveSkill(this.currentTurn)
      let enemySkill = this.currentTurn.skills.find(s => s.selected === true)

      if (enemySkill!.type === 'damage'){

        if (enemySkill!.target === 'enemy') {
          const target = this.allies.find((ally) => ally.currentHp > 0)
          this.useSkill([target!], enemySkill!)
        }

        if (enemySkill!.target === 'enemyTeam'){
          let aliveAlies = this.allies.filter(a => a.currentHp > 0)
          this.useSkill(aliveAlies, enemySkill!)
        }

      }
  
      await wait(1.5)
      this.nextTurn()
    }

    
  }


  setActiveSkill(character: Character): void{
    if(!character.skills) return

    for (let skill of character.skills) {
      if (skill.currentCooldown === 0){

        if (skill.type === 'damage' || skill.type === 'debuff') {
          skill.selected = true
        }

        break
      }
    }
  }

  selectSkill(skill: Skill): void{
    if(!this.currentTurn.skills) return
    let skills = this.currentTurn.skills

    skills.forEach(s => s.selected = false)
    skill.selected = true

    this.selectedSkill = skill
    
    console.log(this.selectedSkill)
  }

  selectTarget(target: Character, weaponAttack: boolean = false): void {
    if(weaponAttack){
      this.weaponAttack(target)
      return
    }
    if(!this.selectedSkill) return 

    let skill = this.selectedSkill

    if (skill.target === 'enemy') this.useSkill([target], skill)

    if (skill.target === 'enemyTeam') this.useSkill(this.aliveEnemies, skill)

    if (skill.target === 'self' || skill.target === 'teamMember' ) this.useSkill([target], skill)

    if (skill.target === 'team') this.useSkill(this.aliveAllies, skill)

  }

  async heal(target: Character, value: number) : Promise<void>{

    target.currentHp = Math.min(target.currentHp + value, target.maxHp)
      
    // await wait(1.5)
    // if(!targets[0].isEnemy) this.nextTurn()
  }

  useSkill(targets: Character[], skill: Skill): void {
    skill.currentCooldown = skill.cooldown

    if ( skill.costType === 'cp') this.currentTurn.currentCp -= skill.cost
    if ( skill.costType === 'hp') this.dealDamage(this.currentTurn, skill.cost)

    if(skill.type === 'damage') {
      let isCriticalHit = Math.random() * 100 < this.currentTurn.critChance;
      for ( let target of targets) this.dealDamage(target, skill.value, isCriticalHit ? 100 : 0) 
    }

    if(skill.type === 'heal') {
      for ( let target of targets) this.heal(target, skill.value)
      
    }

    if (skill.type === 'debuff' && skill.effect){
      for ( let target of targets) target.statusEffects.push(structuredClone(skill.effect))
    }

    if (skill.type === 'buff' && skill.effect){
      for ( let target of targets) target.statusEffects.push(structuredClone(skill.effect))
    }
    
  }

  dealDamage(target: Character, value: number, critChance: number = 0): Promise<void> {
    return new Promise(async (res, rej) => {

      let isCriticalHit = Math.random() * 100 < critChance;
      let finalDamage = isCriticalHit ? Math.floor(value * 1.5) : value

      target.currentHp = Math.max(target.currentHp - finalDamage, 0)

      if(target.currentHp <= 0){
        target.statusEffects = []
        // this.nextTurn()
      }

      await wait(1)

      res()
    })
    
  }

  async weaponAttack(target: Character) {
    console.log(this.currentTurn.name, ' recovers CP')
    this.currentTurn.currentCp = Math.min(this.currentTurn.maxCp, this.currentTurn.currentCp + Math.floor(this.currentTurn.maxCp * 0.2))
    await this.dealDamage(target, this.currentTurn.baseDmg, this.currentTurn.critChance)
    if(!this.currentTurn.isEnemy) this.nextTurn()
  }

  
  processStatusEffects(character: Character): Promise<void> {
    return new Promise(async (res, rej) => {
      for (const effect of character.statusEffects) {
        if (effect.type === 'damage') await this.dealDamage(character, effect.value)
        if (effect.type === 'heal') await this.heal(character, effect.value)

        effect.duration--
    
        if (effect.duration <= 0) {
          console.log(`Efekt ${effect.name} na ${character.name} wygasł.`);
        }
      }
      character.statusEffects = character.statusEffects.filter(effect => effect.duration > 0)
      res()
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
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url])
    })
  }

  updateDisplayedTurnOrder(turnOrder: Character[]): void{
    let tmp = turnOrder
    
    const before = tmp.slice(0, this.turnIndex)
    const after = tmp.slice(this.turnIndex)

    tmp = [...after, ...before]
    tmp = tmp.filter(character => character.currentHp > 0)
    this.displayedTurnOrder = tmp

  }

  

  
}
