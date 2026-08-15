import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  login(username: string, password: string): Observable<any> {
    return this.api.post('/auth/login', { username, password });
  }
}
