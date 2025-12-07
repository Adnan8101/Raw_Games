import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, GuildMember } from 'discord.js';
import { getMemoryGameManager } from './gameInstance';
import { PermissionUtils } from '../../../utils/PermissionUtils';

export const memoryCommands = [
    new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Memory Game commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a new Memory Game')
                .addIntegerOption(option =>
                    option.setName('emoji_count')
                        .setDescription('How many emojis to generate (3-10)')
                        .setMinValue(3)
                        .setMaxValue(10)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('time')
                        .setDescription('How many seconds the image stays visible')
                        .setMinValue(1)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Force stop the current Memory Game'))
];

export const category = 'Games';
export const permission = 'Manage Guild';
export const syntax = '/memory start [options]';
export const example = '/memory start emoji_count:5';
export const data = memoryCommands[0];

export const execute = async (interaction: ChatInputCommandInteraction, services: any) => {
    // Check for game permission
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

    await handleMemoryCommand(interaction);
}

export const handleMemoryCommand = async (interaction: ChatInputCommandInteraction) => {
    const { commandName, options, channelId } = interaction;

    if (commandName === 'memory') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'start') {
            const emojiCount = options.getInteger('emoji_count') || 5;
            const time = options.getInteger('time');

            const manager = getMemoryGameManager(interaction.client);
            const success = await manager.startGame(interaction, emojiCount, time);

            if (!success) {
                await interaction.reply({ content: 'A game is already running in this channel.', flags: MessageFlags.Ephemeral });
            }
        } else if (subcommand === 'end') {
            const manager = getMemoryGameManager(interaction.client);
            const success = await manager.stopGame(interaction);

            if (success) {
                await interaction.reply({ content: 'Game stopped successfully.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'No active game found to stop.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
