import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { GatewayController } from './facade/gateway.controller'
import { ProxyService } from './proxy/proxy.service'
import { AuthMiddleware } from './resolver/auth.middleware'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme-in-production',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [GatewayController],
  providers: [ProxyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Le middleware d'authentification s'applique à toutes les routes sauf /auth/login
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'auth/login', method: RequestMethod.POST })
      .forRoutes('*')
  }
}
