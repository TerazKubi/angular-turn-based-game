import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Character, Skill } from '../models/character';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/battleService.service';

@Component({
  selector: 'app-battle-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-character.component.html',
  styleUrl: './battle-character.component.css'
})
export class BattleCharacterComponent {
  @Input() character!: Character
  @Input() currentHp!: number

  @Input() currentTurn!: Character | null

  @Output() targetSelected = new EventEmitter<any>()

  isTargetSelectable: boolean = false;
  isHighlightAll: boolean = false;

  damageNumbers: number[] = []
  healNumbers: number[] = []

  isBlinking: boolean = false

  private currentSkill: Skill | null = null
  currentSkillAnimation: string | null = null

  constructor(private gameService: GameService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('change')
    const change = changes['currentHp']

    if(!change) return

    if (change.previousValue !== null && change.currentValue !== null &&
      change.previousValue !== undefined && change.currentValue !== undefined) {
      
        
      const diffValue = change.previousValue - change.currentValue
      console.log('HP changed: ', 'from', change.previousValue, 'to', change.currentValue, "Dif value: ", diffValue)

      if (diffValue > 0) {
        // console.log('damage')
        this.triggerBlink()
        if(this.character.hpChange) {
          this.showNumberAnimation(this.character.hpChange * -1, this.damageNumbers)
          
        }
      }
      if (diffValue < 0) {
        // console.log('heal')
        this.showNumberAnimation(diffValue * -1, this.healNumbers)
      }

      if(this.currentSkill){
        this.playSpriteAnimation('sprite-animation')
      }
    }
  }


  ngOnInit(): void {
    this.gameService.skill$.subscribe((skill) => {
      if(!skill){
        this.isTargetSelectable = false
        return
      } 
      this.currentSkill = skill

      if(this.character.isEnemy && (skill.target === 'enemy' || skill.target === 'enemyTeam') ) {
        this.isTargetSelectable = true

      } 
      else if( !this.character.isEnemy && (skill.target === 'teamMember' || skill.target === 'team')){
        this.isTargetSelectable = true

      
      }
      else if(!this.character.isEnemy && skill.target === 'self' && this.currentTurn?.name === this.character.name) {
        this.isTargetSelectable = true
      }
      else {
        
        this.isTargetSelectable = false
      }

    })

    this.gameService.action$.subscribe((action) => {
      if (action === 'Weapon attack' && this.character.isEnemy) {
        this.isTargetSelectable = true
        this.isHighlightAll = false
      }
    })

    this.gameService.isHoveringTeam$.subscribe((isHovering) => {

      if(this.isTargetSelectable) this.isHighlightAll = isHovering
      else this.isHighlightAll = false
    })
  }

  onClick(): void {
    if (this.isTargetSelectable) {
      this.targetSelected.emit(this.character); // Emit the selected target
      this.gameService.clearSkill(); // Exit target selection mode
    }
  }

  onMouseEnter(): void {
    if (this.currentSkill?.target === 'enemyTeam' || this.currentSkill?.target === 'team') {
      if (this.isTargetSelectable) this.gameService.setHoveringTeam(true);

    }
    
  }

  onMouseLeave(): void {
    // if (this.currentSkill?.target === 'enemyTeam' && this.character.isEnemy) {
      this.gameService.setHoveringTeam(false);
    // }
  }

  getHpBarWidth(): number{
    return (this.character.currentHp / this.character.maxHp) * 100
  }
  getCpBarWidth(): number{
    return (this.character.currentCp / this.character.maxCp) * 100
  }

  triggerBlink(): void{
    this.isBlinking = true
  
    // Remove the blinking effect after the animation ends
    setTimeout(() => {
      this.isBlinking = false
    }, 300); // Match the duration of the CSS animation
  }

  showNumberAnimation(number: number, numbers: number[]): void {
    numbers.push(number)

    setTimeout(() => {
      numbers.shift()
    }, 1000)
  }

  playSpriteAnimation(animationClass: string) {
    this.currentSkillAnimation = animationClass;

    // Remove the animation class after the animation completes
    setTimeout(() => {
      this.currentSkillAnimation = null;
    }, 1000); // Match the CSS animation duration
  }

}
