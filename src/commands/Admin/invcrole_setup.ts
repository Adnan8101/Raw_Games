import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, MessageFlags, Role } from 'discord.js';
import { ConfigManager } from '../../utils/ConfigManager';

export const data = new SlashCommandBuilder()
    .setName('invcrole_setup')
    .setDescription('Configure Global Voice Channel Role (assigned when joining ANY VC)')
    .addSubcommand(sub =>
        sub.setName('setup')
            .setDescription('Set the role and enable')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The Role to assign')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('disable')
            .setDescription('Disable Global VC Role')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
        const role = interaction.options.getRole('role', true) as Role;

        // Save to DB
        await ConfigManager.setInvcRole(interaction.guild.id, role.id);

        await interaction.editReply({
            content: `✅ **Global VC Role Set**: ${role}\nUsers joining **ANY** Voice Channel will get this role.\n(Note: Users currently in VC will receive it on next update or rejoin/move).`
        });

        // Optional: Auto-assign to current users? 
        // User asked "when ever yehy join a vc bot will assign a role".
        // Usually good to scan existing.
        try {
            const roleObj = interaction.guild.roles.cache.get(role.id);
            if (roleObj) {
                let count = 0;
                // Scan all voice states
                for (const [_, vs] of interaction.guild.voiceStates.cache) {
                    const member = vs.member;
                    if (member && !member.roles.cache.has(role.id)) {
                        try {
                            await member.roles.add(role.id);
                            count++;
                        } catch (e) {
                            // ignore permissions error
                        }
                    }
                }

                if (count > 0) {
                    await interaction.followUp({ content: `🔄 Applied role to ${count} existing users in VC.`, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.followUp({ content: `✅ No users needed the role update (or all already had it).`, flags: MessageFlags.Ephemeral });
                }
            }
        } catch (e) { }

    } else if (subcommand === 'disable') {
        await ConfigManager.removeInvcRole(interaction.guild.id);
        await interaction.editReply({
            content: '❌ **Global VC Role Disabled**.'
        });
    }
};
