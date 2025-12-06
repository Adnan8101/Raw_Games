import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { ConfigManager } from './ConfigManager';

export class PermissionUtils {
    /**
     * Check if a member has permission to use game commands.
     * Returns true if member has Manage Guild permission OR has the designated game role.
     */
    static async hasGamePermission(member: GuildMember): Promise<boolean> {
        // Check if member has Manage Guild permission
        if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return true;
        }

        // Check if member has the game role
        const gameRoleId = await ConfigManager.getGameRole(member.guild.id);
        if (gameRoleId && member.roles.cache.has(gameRoleId)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a member has administrator permission.
     */
    static isAdmin(member: GuildMember): boolean {
        return member.permissions.has(PermissionFlagsBits.Administrator);
    }
}
