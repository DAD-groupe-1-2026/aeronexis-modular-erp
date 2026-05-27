import { All, Controller, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtGuard } from '../resolver/jwt.guard'
import { ProxyService } from '../proxy/proxy.service'

/**
 * Façade unique — point d'entrée de toute communication entre les applications
 * et la plateforme. Expose tous les services via un endpoint unique /api/*.
 *
 * Responsabilités :
 *  - Recevoir toutes les requêtes entrantes
 *  - Déléguer la vérification JWT au JwtGuard (contrôleur de résolution)
 *  - Transmettre au ProxyService (proxy/orchestration) pour routage
 */
@Controller()
export class GatewayController {
  constructor(private readonly proxy: ProxyService) {}

  // Route publique : authentification (pas de JWT requis)
  @All('auth/*')
  handleAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'auth')
  }

  // Routes protégées : toutes nécessitent un JWT valide
  @All('api/production/*')
  @UseGuards(JwtGuard)
  handleProduction(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'production')
  }

  @All('api/logistics/*')
  @UseGuards(JwtGuard)
  handleLogistics(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'logistics')
  }

  @All('api/sales/*')
  @UseGuards(JwtGuard)
  handleSales(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'sales')
  }

  @All('api/traceability/*')
  @UseGuards(JwtGuard)
  handleTraceability(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'traceability')
  }

  @All('api/notifications/*')
  @UseGuards(JwtGuard)
  handleNotifications(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'notifications')
  }
}
