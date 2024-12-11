import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState } from '../models/gameState';
import { Skill } from '../models/character';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private currentState = new BehaviorSubject<GameState>(GameState.CheckBattleOver);
    public state$ = this.currentState.asObservable();

    private skillSubject = new BehaviorSubject<Skill | null>(null); // Current chosen skill
    private targetSelectionMode = new BehaviorSubject<boolean>(false); // Whether target selection is active

    skill$ = this.skillSubject.asObservable();
    targetSelectionMode$ = this.targetSelectionMode.asObservable();

    private isHoveringTeam = new BehaviorSubject<boolean>(false);
    isHoveringTeam$ = this.isHoveringTeam.asObservable();

    constructor() {}

    setState(state: GameState): void {
        this.currentState.next(state);
    }

    getState(): GameState {
        return this.currentState.getValue();
    }

    chooseSkill(skill: Skill): void {
        this.skillSubject.next(skill);
        this.targetSelectionMode.next(true); // Enable target selection mode
    }
    
    clearSkill(): void {
        this.skillSubject.next(null);
        this.targetSelectionMode.next(false);
        this.setHoveringTeam(false)
    }

    setHoveringTeam(isHovering: boolean): void {
        this.isHoveringTeam.next(isHovering);
    }
}