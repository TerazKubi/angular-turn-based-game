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

    private actionSubject = new BehaviorSubject<string | null>(null)
    private skillSubject = new BehaviorSubject<Skill | null>(null)
    private targetSelectionMode = new BehaviorSubject<boolean>(false)

    action$ = this.actionSubject.asObservable()
    skill$ = this.skillSubject.asObservable()
    targetSelectionMode$ = this.targetSelectionMode.asObservable()

    private isHoveringTeam = new BehaviorSubject<boolean>(false)
    isHoveringTeam$ = this.isHoveringTeam.asObservable()

    constructor() {}

    setState(state: GameState): void {
        this.currentState.next(state);
    }

    getState(): GameState {
        return this.currentState.getValue();
    }

    chooseAction(action: string | null): void {
        this.actionSubject.next(action)
    }
    clearAction(): void {
        this.actionSubject.next(null)
        this.setTargetSelectionMode(false)
    }

    setTargetSelectionMode(isSelectingTarget: boolean): void {
        this.targetSelectionMode.next(isSelectingTarget);
    }

    chooseSkill(skill: Skill | null): void {
        this.skillSubject.next(skill);
         // Enable target selection mode
    }
    
    clearSkill(): void {
        this.skillSubject.next(null);
        this.setTargetSelectionMode(false)
        this.setHoveringTeam(false)
    }

    setHoveringTeam(isHovering: boolean): void {
        this.isHoveringTeam.next(isHovering);
    }
}