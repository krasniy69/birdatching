import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'birduser',
  password: process.env.DATABASE_PASSWORD || 'birdpass123',
  database: process.env.DATABASE_NAME || 'birdwatching',
}));



