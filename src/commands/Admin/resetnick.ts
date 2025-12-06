import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType, VoiceChannel, MessageFlags } from 'discord.js';
import { ConfigManager } from '../../utils/ConfigManager';

export const data = new SlashCommandBuilder()
    .setName('resetnick')
    .setDescription('Configure continuous nickname reset for a Voice Channel')
    .addSubcommand(sub =>
        sub.setName('enable')
            .setDescription('Enable auto-reset for a specific VC')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The Voice Channel to monitor')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName('disable')
            .setDescription('Disable auto-reset')
    )
    .addSubcommand(sub =>
        sub.setName('status')
            .setDescription('Check current status')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'enable') {
        const channel = interaction.options.getChannel('channel', true) as VoiceChannel;

        await ConfigManager.setNicknameResetChannel(interaction.guild.id, channel.id);

        // Immediate Effect: Reset everyone currently in it
        let resetCount = 0;
        channel.members.forEach(async (member) => {
            if (member.nickname) {
                try {
                    await member.setNickname(null);
                    resetCount++;
                } catch (e) {
                    console.error(`Failed to reset ${member.user.tag}`, e);
                }
            }
        });

        await interaction.reply({
            content: `✅ **Enabled Auto-Nickname Reset** for <#${channel.id}>.\n🔄 Triggered immediate reset for ${resetCount} users.`,
            flags: MessageFlags.Ephemeral
        });

    } else if (subcommand === 'disable') {
        await ConfigManager.removeNicknameResetChannel(interaction.guild.id);
        await interaction.reply({
            content: '❌ **Disabled Auto-Nickname Reset**.',
            flags: MessageFlags.Ephemeral
        });

    } else if (subcommand === 'status') {
        const channelId = await ConfigManager.getNicknameResetChannel(interaction.guild.id);
        if (channelId) {
            await interaction.reply({
                content: `✅ Active. Monitoring channel: <#${channelId}>`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: '❌ Not currently monitoring any channel.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
