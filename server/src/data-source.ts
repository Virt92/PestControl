import { DataSource } from 'typeorm';
import * as path from 'path';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'pestcontrol',
  password: process.env.DB_PASS || 'pestcontrol',
  database: process.env.DB_NAME || 'pestcontrol',
  entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
