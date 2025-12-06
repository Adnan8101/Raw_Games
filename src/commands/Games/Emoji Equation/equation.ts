
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, EmbedBuilder, GuildMember } from 'discord.js';
import { getEmojiEquationManager, Difficulty } from './gameInstance';
import { PermissionUtils } from '../../../utils/PermissionUtils';

export const category = 'Games';
export const permission = 'Manage Guild';
export const syntax = '/equation start <difficulty> [time]';
export const example = '/equation start difficulty:easy';

export const equationCommand = new SlashCommandBuilder()
    .setName('equation')
    .setDescription('Manage Emoji Equation games')
    .addSubcommand(subcommand =>
        subcommand
            .setName('start')
            .setDescription('Start a new Emoji Equation game')
            .addStringOption(option =>
                option.setName('difficulty')
                    .setDescription('Game difficulty')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Easy', value: 'easy' },
                        { name: 'Medium', value: 'medium' },
                        { name: 'Hard', value: 'hard' }
                    ))
            .addIntegerOption(option =>
                option.setName('time')
                    .setDescription('Time in seconds before image deletion (optional)')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('end')
            .setDescription('End the current game'));

export const data = equationCommand;

export const execute = async (interaction: ChatInputCommandInteraction, services: any) => {
    // Check permissions
    if (!interaction.guild || !interaction.member) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
        return;
    }

    const member = interaction.member as GuildMember;
    // Check for game permission
    if (!await PermissionUtils.hasGamePermission(member)) {
        await interaction.reply({
            content: '❌ You need the **Game Role** or **Manage Guild** permission to use this command.',
            ephemeral: true
        });
        return;
    }

    await handleEquationCommand(interaction);
}

export const handleEquationCommand = async (interaction: ChatInputCommandInteraction) => {
    if (interaction.commandName !== 'equation') return;

    const subcommand = interaction.options.getSubcommand();
    const manager = getEmojiEquationManager(interaction.client);
    const channelId = interaction.channelId;

    if (subcommand === 'start') {
        const difficulty = interaction.options.getString('difficulty', true) as Difficulty;
        const time = interaction.options.getInteger('time') || undefined;

        await interaction.deferReply({ ephemeral: true });

        const success = await manager.startGame(channelId, difficulty, interaction.user.id, time);

        if (success) {
            await interaction.editReply('🎮 **Game Started!** Check the channel for the equation.');
        } else {
            await interaction.editReply('❌ A game is already active in this channel.');
        }
    } else if (subcommand === 'end') {
        await interaction.deferReply({ ephemeral: true });
        const answer = await manager.stopGame(channelId);

        if (answer !== null) {
            const channel = interaction.channel as TextChannel;
            const embed = new EmbedBuilder()
                .setDescription(`🛑 ** Game Ended by Admin.**\nNo correct answer was found.\nThe correct answer was: ** ${answer}** `)
                .setColor('#ff0000');

            if (channel) {
                await channel.send({ embeds: [embed] });
            }

            await interaction.editReply('✅ Game ended successfully.');
        } else {
            await interaction.editReply('❌ No active game found in this channel.');
        }
    }
};
