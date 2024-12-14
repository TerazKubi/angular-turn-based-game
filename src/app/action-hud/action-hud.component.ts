import { Component, Input } from '@angular/core';
import { Character, Skill } from '../models/character';
import { CommonModule } from '@angular/common';
import { BattleAction } from '../models/battleAction';
import { GameService } from '../services/battleService.service';
import { GameState } from '../models/gameState';


@Component({
  selector: 'app-action-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-hud.component.html',
  styleUrl: './action-hud.component.css'
})
export class ActionHudComponent {
  @Input() character!: Character
  sub: any = null
  
  battleActions: string[] = ['Weapon attack', 'Skills', 'Items', 'Meditate', 'Run']
  activeAction: string | null = null

  selectedSkill: Skill | null = null

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((state) => {
      if(state === GameState.ChooseAction) 
        this.selectedSkill = null
        this.character.skills.forEach(s => s.selected = false)
    })
  }

  selectAction(action: string | null = null): void {
    if (!action) {
      this.selectedSkill = null
      this.activeAction = null
      this.character.skills.forEach(s => s.selected = false)
      this.gameService.clearSkill()
      this.gameService.clearAction()
      return
    }

    
    this.activeAction = action
    this.gameService.chooseAction(action)
    
    if(action === 'Weapon attack'){
      this.gameService.setTargetSelectionMode(true)
    }

    if(action === 'Meditate'){
      this.gameService.setState(GameState.ExecuteAction)
    }
    
  }

  selectSkill(skill: Skill): void{
    if( (skill.cost > this.character.currentCp && skill.costType === 'cp') || skill.currentCooldown > 0) 
      return

    let skills = this.character.skills

    skills.forEach(s => s.selected = false)
    skill.selected = true

    this.selectedSkill = skill
    this.chooseSkill(skill)
  }

  chooseSkill(skill: Skill): void {
    this.gameService.chooseSkill(skill)
    
      
  }

  ngOnDestroy(): void{
    this.sub.unsubscribe()
  }

}
