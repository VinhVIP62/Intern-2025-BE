import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observer } from 'rxjs';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
