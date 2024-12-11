import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent {

  constructor(private router: Router) {}

  goToMissions(): void{
    this.router.navigate(["missions"])
  }
}
