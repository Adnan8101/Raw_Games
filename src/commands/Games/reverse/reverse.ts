import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, GuildMember } from 'discord.js';
import { getReverseGameManager } from './reverseManager';
import { PermissionUtils } from '../../../utils/PermissionUtils';

export const reverseCommands = [
    new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Sentence Reverse Game commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a new Reverse Game')
                .addStringOption(option =>
                    option.setName('difficulty')
                        .setDescription('Difficulty level')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Easy', value: 'Easy' },
                            { name: 'Medium', value: 'Medium' },
                            { name: 'Hard', value: 'Hard' }
                        ))
                .addIntegerOption(option =>
                    option.setName('time')
                        .setDescription('Time in seconds to memorize (0 for unlimited)')
                        .setMinValue(0)
                        .setMaxValue(60)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('length')
                        .setDescription('Number of words (default: 1)')
                        .setMinValue(1)
                        .setMaxValue(20)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Force stop the current Reverse Game'))
];

export const category = 'Games';
export const permission = 'Manage Guild';
export const syntax = '/reverse start [options]';
export const example = '/reverse start difficulty:Easy';
export const data = reverseCommands[0];

export const execute = async (interaction: ChatInputCommandInteraction, services: any) => {
    // Check permissions
    if (!interaction.guild || !interaction.member) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', flags: MessageFlags.Ephemeral });
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

    await handleReverseCommand(interaction);
}

export const handleReverseCommand = async (interaction: ChatInputCommandInteraction) => {
    const { commandName, options } = interaction;

    if (commandName === 'reverse') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'start') {
            const difficulty = options.getString('difficulty') || 'Easy';
            const time = options.getInteger('time') ?? 0;
            const length = options.getInteger('length') || 1;

            const manager = getReverseGameManager(interaction.client);
            const success = await manager.startGame(interaction, difficulty, time, length);

            if (!success) {
                await interaction.reply({ content: 'A game is already running in this channel.', flags: MessageFlags.Ephemeral });
            }
        } else if (subcommand === 'end') {
            const manager = getReverseGameManager(interaction.client);
            const success = await manager.stopGame(interaction);

            if (success) {
                await interaction.reply({ content: 'Game stopped successfully.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'No active game found to stop.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
