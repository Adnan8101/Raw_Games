import * as fs from 'fs';
import * as path from 'path';
import { connectDatabase } from './database';
import { GuildConfig } from '../models/GuildConfig';
import { config } from 'dotenv';

config();

const migrate = async () => {
    await connectDatabase();

    const dataDir = path.join(process.cwd(), 'data', 'guilds');
    if (!fs.existsSync(dataDir)) {
        console.log('No local data directory found.');
        process.exit(0);
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} config files to migrate.`);

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);

            if (json.guildId && json.gameRoleId) {
                await GuildConfig.findOneAndUpdate(
                    { guildId: json.guildId },
                    { gameRoleId: json.gameRoleId },
                    { upsert: true, new: true }
                );
                console.log(`✅ Migrated guild ${json.guildId}`);
            }
        } catch (e) {
            console.error(`Error migrating ${file}`, e);
        }
    }

    console.log('Migration complete.');
    process.exit(0);
};

migrate();
