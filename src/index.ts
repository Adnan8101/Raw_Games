import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { ConfigManager } from './utils/ConfigManager';
import { connectDatabase } from './utils/database';

config();
connectDatabase();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check if user JOINED or MOVED to a channel
    if (newState.channelId && newState.member && newState.guild) {
        try {
            const monitoredChannelId = await ConfigManager.getNicknameResetChannel(newState.guild.id);

            if (monitoredChannelId && newState.channelId === monitoredChannelId) {
                const member = newState.member;
                if (member.nickname) {
                    try {
                        await member.setNickname(null);
                        console.log(`🔄 Reset nickname for ${member.user.tag} in configured reset channel.`);
                    } catch (error) {
                        console.error(`Failed to reset nickname for ${member.user.tag}:`, error);
                    }
                }
            }
        } catch (e) {
            console.error('Error in voiceStateUpdate nickname reset:', e);
        }
    }
});

// Create a collection to store commands
(client as any).commands = new Collection();

const commands: any[] = [];

// Load Game commands (nested in subdirectories)
const gamesPath = path.join(__dirname, 'commands', 'Games');
if (fs.existsSync(gamesPath)) {
    const gameDirectories = fs.readdirSync(gamesPath);
    for (const gameDir of gameDirectories) {
        const gamePath = path.join(gamesPath, gameDir);
        const gameStats = fs.statSync(gamePath);

        if (gameStats.isDirectory()) {
            const gameFiles = fs.readdirSync(gamePath).filter(file =>
                file.endsWith('.ts') || file.endsWith('.js')
            );

            for (const file of gameFiles) {
                const filePath = path.join(gamePath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    (client as any).commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded Games command: ${command.data.name}`);
                }
            }
        }
    }
}

// Load Admin commands (flat files)
const adminPath = path.join(__dirname, 'commands', 'Admin');
if (fs.existsSync(adminPath)) {
    const adminFiles = fs.readdirSync(adminPath).filter(file =>
        file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of adminFiles) {
        const filePath = path.join(adminPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            (client as any).commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded Admin command: ${command.data.name}`);
        }
    }
}

// Load Utility commands (flat files)
const utilityPath = path.join(__dirname, 'commands', 'Utility');
if (fs.existsSync(utilityPath)) {
    const utilityFiles = fs.readdirSync(utilityPath).filter(file =>
        file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of utilityFiles) {
        const filePath = path.join(utilityPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            (client as any).commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded Utility command: ${command.data.name}`);
        }
    }
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commandsJSON = commands.map(cmd => cmd); // Already JSON

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commandsJSON },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Handle interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = (client as any).commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, {});
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Handle messages for game responses
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Import game managers dynamically
    const { getEmojiEquationManager } = require('./commands/Games/Emoji Equation/gameInstance');
    const { getMathGameManager } = require('./commands/Games/Math Game/mathGameInstance');
    const { getMemoryGameManager } = require('./commands/Games/Memory Game/gameInstance');
    const { getHiddenNumberGameManager } = require('./commands/Games/Hidden Number/hiddenGameInstance');
    const { getReverseGameManager } = require('./commands/Games/reverse/reverseManager');
    const { getSequenceGameManager } = require('./commands/Games/sequence/sequenceManager');
    const { getVowelsGameManager } = require('./commands/Games/vowels/vowelsManager');
    const { GuessTheNumberManager } = require('./commands/Games/Guess the Number/manager');

    // Check all game managers
    const managers = [
        getEmojiEquationManager(client),
        getMathGameManager(client),
        getMemoryGameManager(client),
        getHiddenNumberGameManager(client),
        getReverseGameManager(client),
        getSequenceGameManager(client),
        getVowelsGameManager(client),
        GuessTheNumberManager.getInstance(client),
    ];

    // Handle message for each manager
    for (const manager of managers) {
        if (manager && typeof manager.handleMessage === 'function') {
            await manager.handleMessage(message);
        }
    }
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user?.tag}!`);
    console.log(`🎮 Games Bot is ready!`);
});

client.login(process.env.DISCORD_TOKEN);
