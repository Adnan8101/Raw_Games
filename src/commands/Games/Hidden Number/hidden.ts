import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, GuildMember } from 'discord.js';
import { getHiddenNumberGameManager } from './hiddenGameInstance';
import { PermissionUtils } from '../../../utils/PermissionUtils';

export const hiddenNumberCommands = [
    new SlashCommandBuilder()
        .setName('hidden')
        .setDescription('Hidden Number Game commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a new Hidden Number Game')
                .addStringOption(option =>
                    option.setName('difficulty')
                        .setDescription('Difficulty level')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Easy', value: 'Easy' },
                            { name: 'Medium', value: 'Medium' },
                            { name: 'Hard', value: 'Hard' }
                        ))
                .addIntegerOption(option =>
                    option.setName('time')
                        .setDescription('Time in seconds to view the image (0 for unlimited)')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(60))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to start the game in')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Force stop the current Hidden Number Game'))
];

export const category = 'Games';
export const permission = 'Manage Guild';
export const syntax = '/hidden start <difficulty> [options]';
export const example = '/hidden start difficulty:Easy';
export const data = hiddenNumberCommands[0];

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

    await handleHiddenNumberCommand(interaction);
}

export const handleHiddenNumberCommand = async (interaction: ChatInputCommandInteraction) => {
    const { commandName, options } = interaction;

    if (commandName === 'hidden') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'start') {
            const difficulty = options.getString('difficulty', true);
            const time = options.getInteger('time') || 0;
            const channel = options.getChannel('channel') || interaction.channel;

            const manager = getHiddenNumberGameManager(interaction.client);

            const success = await manager.startGame(interaction, difficulty, time, channel);

            if (!success) {
                await interaction.reply({ content: 'A game is already running in that channel.', flags: MessageFlags.Ephemeral });
            }
        } else if (subcommand === 'end') {
            const manager = getHiddenNumberGameManager(interaction.client);

            const success = await manager.stopGame(interaction);

            if (!success) {
                await interaction.reply({ content: 'No active game found to stop.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
