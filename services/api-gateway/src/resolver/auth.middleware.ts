import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response, NextFunction } from 'express'

/**
 * Contrôleur de résolution — Extraction et enrichissement des claims JWT.
 *
 * S'applique sur toutes les routes (sauf /auth/login).
 * Tente de décoder le token s'il est présent et attache les claims
 * à la requête sans bloquer (le JwtGuard bloque si requis).
 * Cela permet aux handlers de lire req.user même pour les routes optionnelles.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request & { user?: unknown }, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        const token = auth.slice(7)
        const payload = this.jwtService.decode(token)
        req.user = payload
      } catch {
        // Token malformé — on laisse passer, le JwtGuard rejettera si la route est protégée
      }
    }
    next()
  }
}
