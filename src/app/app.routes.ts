import { Routes } from '@angular/router';

import { BattleComponent } from './battle/battle.component';
import { CityComponent } from './city/city.component';
import { MissionsComponent } from './missions/missions.component';

export const routes: Routes = [
    { path: '', redirectTo: '/city', pathMatch: 'full' },
    { path: 'city', component: CityComponent},
    { path: 'missions', component: MissionsComponent}
    
];
