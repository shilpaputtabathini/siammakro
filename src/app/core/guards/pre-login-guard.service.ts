import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PreLoginGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
