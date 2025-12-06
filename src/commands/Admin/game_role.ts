import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { ConfigManager } from '../../utils/ConfigManager';
import { PermissionUtils } from '../../utils/PermissionUtils';

export const category = 'Admin';
export const permission = 'Administrator';
export const syntax = '/game_role <set|remove|view>';
export const example = '/game_role set role:@GameManager';

export const data = new SlashCommandBuilder()
    .setName('game_role')
    .setDescription('Manage the game role that grants access to all game commands')
    .addSubcommand(subcommand =>
        subcommand
            .setName('set')
            .setDescription('Set the game role for this server')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to grant game permissions')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove the game role configuration'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('View the current game role'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (interaction: ChatInputCommandInteraction, services: any) => {
    if (!interaction.guild || !interaction.member) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
        return;
    }

    const member = interaction.member as any;
    const subcommand = interaction.options.getSubcommand();

    // For 'set' and 'remove', require Administrator permission
    if ((subcommand === 'set' || subcommand === 'remove') && !PermissionUtils.isAdmin(member)) {
        await interaction.reply({
            content: '❌ You need **Administrator** permission to manage the game role.',
            ephemeral: true
        });
        return;
    }

    // For 'view', require Manage Guild permission
    if (subcommand === 'view' && !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({
            content: '❌ You need **Manage Guild** permission to view the game role.',
            ephemeral: true
        });
        return;
    }

    const guildId = interaction.guild.id;

    try {
        if (subcommand === 'set') {
            const role = interaction.options.getRole('role', true);

            await ConfigManager.setGameRole(guildId, role.id);

            const embed = new EmbedBuilder()
                .setTitle('✅ Game Role Set')
                .setDescription(`Members with the ${role} role can now use all game commands, even without **Manage Guild** permission.`)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'remove') {
            const currentRole = await ConfigManager.getGameRole(guildId);

            if (!currentRole) {
                await interaction.reply({
                    content: '❌ No game role is currently configured.',
                    ephemeral: true
                });
                return;
            }

            await ConfigManager.removeGameRole(guildId);

            const embed = new EmbedBuilder()
                .setTitle('✅ Game Role Removed')
                .setDescription('The game role configuration has been removed. Only members with **Manage Guild** permission can use game commands now.')
                .setColor('#ff9900')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'view') {
            const gameRoleId = await ConfigManager.getGameRole(guildId);

            const embed = new EmbedBuilder()
                .setTitle('🎮 Game Role Configuration')
                .setTimestamp();

            if (gameRoleId) {
                const role = interaction.guild.roles.cache.get(gameRoleId);
                if (role) {
                    embed.setDescription(`**Current Game Role:** ${role}\n\nMembers with this role can use all game commands.`);
                    embed.setColor('#00aaff');
                } else {
                    embed.setDescription('**Current Game Role:** ⚠️ Role not found (may have been deleted)\n\nPlease set a new game role.');
                    embed.setColor('#ff0000');
                }
            } else {
                embed.setDescription('**Current Game Role:** None\n\nOnly members with **Manage Guild** permission can use game commands.');
                embed.setColor('#888888');
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error('Error executing game_role command:', error);
        await interaction.reply({
            content: '❌ An error occurred while managing the game role.',
            ephemeral: true
        });
    }
};
