import { Component, Input } from '@angular/core';
import { Character, Skill } from '../models/character';
import { CommonModule } from '@angular/common';
import { BattleAction } from '../models/battleAction';
import { GameService } from '../services/battleService.service';


@Component({
  selector: 'app-action-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-hud.component.html',
  styleUrl: './action-hud.component.css'
})
export class ActionHudComponent {
  @Input() character!: Character

  battleActions: string[] = ['Weapon attack', 'Skills', 'Items', 'Meditate', 'Run']
  activeAction: string | null = null

  selectedSkill: Skill | null = null

  constructor(private gameService: GameService) {}

  selectAction(action: string | null = null): void {
    if (!action) {
      this.selectedSkill = null
      this.character.skills.forEach(s => s.selected = false)
      this.gameService.clearSkill()
    }
    this.activeAction = action
  }

  selectSkill(skill: Skill): void{
    let skills = this.character.skills

    skills.forEach(s => s.selected = false)
    skill.selected = true

    this.selectedSkill = skill
    this.chooseSkill(skill)
  }

  chooseSkill(skill: Skill): void {
    this.gameService.chooseSkill(skill)
    
      
  }

}
