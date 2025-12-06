import { GuildConfig } from '../models/GuildConfig';

export class ConfigManager {
    static async getGameRole(guildId: string): Promise<string | null> {
        try {
            const config = await GuildConfig.findOne({ guildId });
            return config?.gameRoleId || null;
        } catch (error) {
            console.error(`Error fetching game role for guild ${guildId}:`, error);
            return null;
        }
    }

    static async setGameRole(guildId: string, roleId: string): Promise<void> {
        try {
            await GuildConfig.findOneAndUpdate(
                { guildId },
                { gameRoleId: roleId },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error(`Error setting game role for guild ${guildId}:`, error);
            throw error;
        }
    }

    static async removeGameRole(guildId: string): Promise<void> {
        try {
            await GuildConfig.updateOne(
                { guildId },
                { $unset: { gameRoleId: "" } }
            );
            // Optionally remove doc if empty, but keeping it is fine.
        } catch (error) {
            console.error(`Error removing game role for guild ${guildId}:`, error);
            throw error;
        }
    }

    static async setNicknameResetChannel(guildId: string, channelId: string) {
        await GuildConfig.findOneAndUpdate(
            { guildId },
            { nicknameResetChannelId: channelId },
            { upsert: true, new: true }
        );
    }

    static async getNicknameResetChannel(guildId: string): Promise<string | null> {
        const config = await GuildConfig.findOne({ guildId });
        return config?.nicknameResetChannelId || null;
    }

    static async removeNicknameResetChannel(guildId: string) {
        await GuildConfig.updateOne({ guildId }, { $unset: { nicknameResetChannelId: "" } });
    }

    static async setInvcRole(guildId: string, roleId: string) {
        await GuildConfig.findOneAndUpdate(
            { guildId },
            { invcRoleId: roleId },
            { upsert: true, new: true }
        );
    }

    static async getInvcRole(guildId: string): Promise<string | null> {
        const config = await GuildConfig.findOne({ guildId });
        return config?.invcRoleId || null;
    }

    static async removeInvcRole(guildId: string) {
        await GuildConfig.updateOne({ guildId }, { $unset: { invcRoleId: "" } });
    }
}
