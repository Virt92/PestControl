import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ObjectsModule } from './objects/objects.module';
import { VisitsModule } from './visits/visits.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ChecksModule } from './checks/checks.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PlansModule } from './plans/plans.module';
import { AuditModule } from './audit/audit.module';
import { FilesModule } from './files/files.module';
import { InspectionsModule } from './inspections/inspections.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres' as const,
        host: cfg.get<string>('DB_HOST') || 'localhost',
        port: parseInt(cfg.get<string>('DB_PORT') || '5432', 10),
        username: cfg.get<string>('DB_USER') || 'pestcontrol',
        password: cfg.get<string>('DB_PASS') || 'pestcontrol',
        database: cfg.get<string>('DB_NAME') || 'pestcontrol',
        autoLoadEntities: true,
        synchronize: (cfg.get<string>('NODE_ENV') || 'development') === 'development',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ObjectsModule,
    VisitsModule,
    MonitoringModule,
    ChecksModule,
    DocumentsModule,
    NotificationsModule,
    PlansModule,
    AuditModule,
    FilesModule,
    InspectionsModule,
    DictionariesModule,
    SchedulerModule,
  ],
})
export class AppModule {}
