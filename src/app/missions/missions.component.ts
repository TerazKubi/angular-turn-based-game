import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Character, Mission } from '../models/character';
import { CommonModule } from '@angular/common';
import { MissionService } from '../services/mission.service';
import { BattleComponent } from "../battle/battle.component";

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, BattleComponent],
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.css'
})
export class MissionsComponent {
  missions: Mission[] = [];

  allies: Character[] = [
    {name: "player", maxHp: 100, currentHp: 100, maxCp: 100, currentCp: 50, baseDmg: 5, speed: 15, critChance: 50, isEnemy: false,
      statusEffects: [],
      skills: [
        {name: "ignite", element:"fire", value: 10, cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemyTeam', cost: 20, costType: 'cp',
          effect: {name: "burn", duration: 1, value: 10, type: 'damage', procChance: 100, triggerTiming: 'start'}
        },
        {name: "regeneration",element:"water", value: 10, cooldown: 5, currentCooldown: 0, type: 'buff', target: 'team', cost: 20, costType: 'cp',
          effect: {name: "regen", duration: 3, value: 10, type: 'heal', procChance: 100, triggerTiming: 'end'}
        },
        {name: "healTeamMember", element:"water",value: 20, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'teamMember', cost: 20, costType: 'cp',},
        {name: "kick", value: 25,element:"physical", cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemy', cost: 20, costType: 'hp',},
        {name: "healTeam",element:"water", value: 5, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'team', cost: 20, costType: 'cp',},
        {name: "healself", element:"water", value: 10, cooldown: 5, currentCooldown: 0, type: 'heal', target: 'self', cost: 20, costType: 'cp',},
        {name: "fireBall",element:"fire", value: 10, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemy', cost: 20, costType: 'cp',
          spriteAnimationClass: 'burning-animation',
          effect: {name: "regen", duration: 3, value: 10, type: 'heal', procChance: 100, triggerTiming: 'end', onSelf: true}
        },
        {name: "fireExplosion", element:"fire", value: 10, cooldown: 5, currentCooldown: 0, hitChance: 50, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp',
          spriteAnimationClass: 'burning-animation',
        },
        
      ]
    },
    {name: "player2", maxHp: 100, currentHp: 100, maxCp: 100, currentCp: 50, baseDmg: 5, speed: 14,critChance: 50, isEnemy: false,
      statusEffects: [],
      skills: [
        {name: "ignite2",element:"fire", value: 5, cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemy', cost: 20, costType: 'cp', effectApplyChance: 50,
          spriteAnimationClass: 'burning-animation',
          effect: {name: "burn2", duration: 3, value: 5, type: 'damage', procChance: 100, triggerTiming: 'end'}
        },
        {name: "fireFlame", element:"fire", value: 15, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp',},
        {name: "electroStrike", element:"electric", value: 10, cooldown: 5, currentCooldown: 0, type: 'damage', target: 'enemyTeam', cost: 20, costType: 'cp',
          spriteAnimationClass: 'electro-skill1-animation'
        },
        {name: "stun", value: 0, element:"other", cooldown: 5, currentCooldown: 0, type: 'debuff', target: 'enemy', cost: 20, costType: 'cp', effectApplyChance: 50,
          effect: {name: "stun", duration: 3, value: 0, type: 'stun', procChance: 100, triggerTiming: 'start'}
        },
      ]
    }
    
  ]

  activeMission: Mission | null = null

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
      // this.router.navigate(['/battle'], {
      //   state: { allies: this.allies, battles: mission.battles }
      // })
      this.activeMission = mission
      console.log(this.activeMission)
    }
  }


}
