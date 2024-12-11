import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionHudComponent } from './action-hud.component';

describe('ActionHudComponent', () => {
  let component: ActionHudComponent;
  let fixture: ComponentFixture<ActionHudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionHudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
