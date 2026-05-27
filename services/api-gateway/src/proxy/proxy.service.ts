import { Injectable, BadGatewayException } from '@nestjs/common'
import { Request, Response } from 'express'
import proxy from 'express-http-proxy'

export type ServiceName =
  | 'auth'
  | 'production'
  | 'logistics'
  | 'sales'
  | 'traceability'
  | 'notifications'

/**
 * Proxy / Orchestration — Routage et load-balancing vers les microservices.
 *
 * Responsabilités :
 *  - Maintenir la table de routage (SERVICE_ROUTES) vers chaque microservice
 *  - Transmettre la requête au service cible en conservant les en-têtes
 *  - Normaliser les erreurs de communication réseau vers le format { status, data, error }
 */
@Injectable()
export class ProxyService {
  private readonly routes: Record<ServiceName, string> = {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
    production: process.env.PRODUCTION_SERVICE_URL ?? 'http://localhost:3002',
    logistics: process.env.LOGISTICS_SERVICE_URL ?? 'http://localhost:3003',
    sales: process.env.SALES_SERVICE_URL ?? 'http://localhost:3004',
    traceability: process.env.TRACEABILITY_SERVICE_URL ?? 'http://localhost:3005',
    notifications: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3006',
  }

  forward(req: Request, res: Response, service: ServiceName): void {
    const target = this.routes[service]
    if (!target) {
      throw new BadGatewayException(`Service inconnu : ${service}`)
    }

    proxy(target, {
      proxyReqOptDecorator(proxyReqOpts, srcReq) {
        // Transmet les en-têtes d'authentification au service cible
        proxyReqOpts.headers = {
          ...proxyReqOpts.headers,
          'x-forwarded-for': srcReq.ip ?? '',
          'x-user': JSON.stringify((srcReq as Request & { user?: unknown }).user ?? null),
        }
        return proxyReqOpts
      },
      userResDecorator(_proxyRes, proxyResData) {
        // Les réponses du microservice sont déjà au format { status, data, error }
        return proxyResData
      },
    })(req, res, (err: unknown) => {
      if (err) {
        res.status(502).json({
          status: 'failure',
          data: null,
          error: {
            code: 'PROXY_ERROR',
            message: err instanceof Error ? err.message : 'Erreur de communication avec le service',
          },
        })
      }
    })
  }
}
