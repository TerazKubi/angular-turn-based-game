import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Character, Mission } from '../models/character';
import { CommonModule } from '@angular/common';
import { MissionService } from '../services/mission.service';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.css'
})
export class MissionsComponent {
  missions: Mission[] = [];

  allies: Character[] = [
    {name: "player", maxHp: 100, currentHp: 100, maxCp: 100, currentCp: 50, baseDmg: 5, speed: 15, critChance: 50, isEnemy: false,
      statusEffects: [],
      skills: [
        {name: "ignite", value: 10, cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemyTeam', cost: 20, costType: 'cp', applyChance: 100,
          effect: {name: "burn", duration: 3, value: 10, type: 'damage', procChance: 100, triggerTiming: 'start'}
        },
        {name: "regeneration", value: 10, cooldown: 5, currentCooldown: 0, type: 'buff', target: 'team', cost: 20, costType: 'cp', applyChance: 100,
          effect: {name: "regen", duration: 3, value: 10, type: 'heal', procChance: 100, triggerTiming: 'end'}
        },
        {name: "healTeamMember", value: 20, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'teamMember', cost: 20, costType: 'cp',},
        {name: "kick", value: 25, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemy', cost: 20, costType: 'hp',},
        {name: "healTeam", value: 5, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'team', cost: 20, costType: 'cp',},
        {name: "healself", value: 10, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'self', cost: 20, costType: 'cp',},
        {name: "fireBall", value: 10, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemy', cost: 20, costType: 'cp',},
        {name: "fireExplosion", value: 10, cooldown: 5, currentCooldown: 0, hitChance: 50, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp'},
        
      ]
    },
    {name: "player2", maxHp: 100, currentHp: 100, maxCp: 100, currentCp: 50, baseDmg: 5, speed: 14,critChance: 50, isEnemy: false,
      statusEffects: [],
      skills: [
        {name: "ignite2", value: 5, cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemy', cost: 20, costType: 'cp', applyChance: 50,
          effect: {name: "burn2", duration: 3, value: 5, type: 'damage', procChance: 100, triggerTiming: 'start'}
        },
        {name: "fireFlame", value: 15, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp',},
        {name: "electroStrike", value: 10, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp'},
        {name: "stun", value: 0, cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemy', cost: 20, costType: 'cp', applyChance: 50,
          effect: {name: "stun", duration: 3, value: 0, type: 'stun', procChance: 100, triggerTiming: 'start'}
        },
      ]
    }
    
  ]

  constructor(private router: Router, private missionService: MissionService) {}

  ngOnInit(): void {
    this.missionService.getMissions().subscribe({
      next: (data) => {
        this.missions = data
        console.log(this.missions)
      },
      error: (err) => console.error('Error fetching missions:', err),
    });
    
  }


  startMission(missionId: number): void {
    const mission = this.missions.find((m) => m.id === missionId);
    if (mission) {
      this.router.navigate(['/battle'], {
        state: { allies: this.allies, battles: mission.battles }
      })
    }
  }


}
