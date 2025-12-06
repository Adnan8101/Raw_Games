import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, GuildMember } from 'discord.js';
import { getMathGameManager } from './mathGameInstance';
import { PermissionUtils } from '../../../utils/PermissionUtils';

export const mathCommands = [
    new SlashCommandBuilder()
        .setName('math')
        .setDescription('Math Memory Game commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('quiz')
                .setDescription('Start a new Math Memory Game')
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
                        .setDescription('How many seconds the image stays visible')
                        .setMinValue(1)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Force stop the current Math Game'))
];

export const category = 'Games';
export const permission = 'Manage Guild';
export const syntax = '/math quiz [difficulty] [time]';
export const example = '/math quiz difficulty:Easy';
export const data = mathCommands[0];

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

    await handleMathCommand(interaction);
}

export const handleMathCommand = async (interaction: ChatInputCommandInteraction) => {
    const { commandName, options } = interaction;

    if (commandName === 'math') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'quiz') {
            const difficulty = options.getString('difficulty') || 'Easy';
            const time = options.getInteger('time') || 0;

            const manager = getMathGameManager(interaction.client);
            const success = await manager.startGame(interaction, difficulty, time);

            if (!success) {
                await interaction.reply({ content: 'A game is already running in this channel.', flags: MessageFlags.Ephemeral });
            }
        } else if (subcommand === 'end') {
            const manager = getMathGameManager(interaction.client);
            const success = await manager.stopGame(interaction);

            if (success) {
                await interaction.reply({ content: 'Game stopped successfully.', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'No active game found to stop.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
