import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtTempAuthGuard extends AuthGuard('temp-jwt') {}
