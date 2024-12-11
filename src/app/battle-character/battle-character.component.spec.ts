import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCharacterComponent } from './battle-character.component';

describe('BattleCharacterComponent', () => {
  let component: BattleCharacterComponent;
  let fixture: ComponentFixture<BattleCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCharacterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattleCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
