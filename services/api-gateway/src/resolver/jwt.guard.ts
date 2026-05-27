import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

/**
 * Contrôleur de résolution — Vérification des droits utilisateur.
 *
 * Vérifie le token JWT présent dans l'en-tête Authorization.
 * Si le token est valide, attache le payload décodé à la requête (req.user)
 * pour que les services en aval connaissent le rôle de l'utilisateur.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(req)

    if (!token) {
      throw new UnauthorizedException('Token manquant')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'changeme-in-production',
      })
      // Attach le payload (id, role) à la requête — disponible dans les handlers
      ;(req as Request & { user: unknown }).user = payload
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré')
    }

    return true
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return null
    return auth.slice(7)
  }
}
