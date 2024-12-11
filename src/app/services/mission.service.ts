import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Mission } from '../models/character';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private missionsUrl = '/assets/data/missions.json'


  constructor(private http: HttpClient) {}

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(this.missionsUrl)
  }
}
