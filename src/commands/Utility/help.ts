import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction
} from 'discord.js';

interface GameHelpData {
    name: string;
    description: string;
    howToPlay: string;
    commands: string[];
}

const gamesData: Record<string, GameHelpData> = {
    'equation': {
        name: 'Emoji Equation',
        description: 'A logic puzzle where symbols represent numbers. Deduce the value of each symbol to solve the final equation.',
        howToPlay: 'Analyze the image to find the numeric value of each icon. Use these values to calculate the answer to the final equation. Type your numeric answer in the chat.',
        commands: ['/equation start [difficulty]']
    },
    'gtn': {
        name: 'Guess the Number',
        description: 'A classic guessing game where players compete to find a hidden number.',
        howToPlay: 'The bot generates a random number within a specified range. Type your guess in the chat. The bot will hint if the secret number is higher or lower than your guess. The first to guess correctly wins.',
        commands: ['/gtn start [min] [max]', '/gtn stop']
    },
    'hidden': {
        name: 'Hidden Number',
        description: 'A visual perception challenge. Locate a specific number hidden within a grid of similar characters.',
        howToPlay: 'A temporary grid containing many numbers will appear. Quickly locate the randomly chosen hidden number before the grid vanishes. Type the number you found to win.',
        commands: ['/hidden start', '/hidden stop']
    },
    'math': {
        name: 'Math Game',
        description: 'A fast-paced arithmetic challenge to test your mental math skills.',
        howToPlay: 'The bot will display a mathematical expression (addition, subtraction, multiplication, etc.). Calculate the result and type the answer as quickly as possible. Speed is key!',
        commands: ['/math quiz [difficulty]', '/math stop']
    },
    'memory': {
        name: 'Memory Game',
        description: 'Test your short-term memory by recalling sequences of items.',
        howToPlay: 'A sequence of items will be displayed briefly. Once it disappears, you must reproduce the sequence or answer a specific question about what you saw.',
        commands: ['/memory start [difficulty]']
    },
    'reverse': {
        name: 'Reverse Game',
        description: 'A typing and brain-teaser game requiring you to reverse text.',
        howToPlay: 'You will be shown a word, sentence, or random string. Type the characters in exact reverse order (e.g., "table" becomes "elbat"). The first correct input wins.',
        commands: ['/reverse start [difficulty] [length]']
    },
    'sequence': {
        name: 'Sequence Game',
        description: 'A pattern recognition game involving number sequences.',
        howToPlay: 'Observe the series of numbers provided. Identify the mathematical pattern governing the sequence and type the next valid number.',
        commands: ['/sequence start [difficulty]']
    },
    'vowels': {
        name: 'Vowels Game',
        description: 'A rapid scanning game to count specific characters.',
        howToPlay: 'Scan the displayed text image and count the total number of vowels (A, E, I, O, U). Type the final count to win.',
        commands: ['/vowels start [difficulty]']
    }
};

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows information about all games and how to play them.');

export async function execute(interaction: ChatInputCommandInteraction) {
    const options = Object.keys(gamesData).map(key => ({
        label: gamesData[key].name,
        description: gamesData[key].description.substring(0, 100),
        value: key
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('Select a game to view details')
        .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    const embed = new EmbedBuilder()
        .setTitle('Games Bot Help')
        .setDescription('Select a game from the dropdown menu below to see how to play and commands.')
        .setColor('#0099ff')
        .addFields({ name: 'Available Games', value: Object.values(gamesData).map(g => `**${g.name}**`).join('\n') });

    const response = await interaction.reply({
        embeds: [embed],
        components: [row],
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300000 // 5 minutes
    });

    collector.on('collect', async (i: StringSelectMenuInteraction) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: 'Only the person who used the command can select options.', ephemeral: true });
            return;
        }

        const selectedGame = gamesData[i.values[0]];

        const newEmbed = new EmbedBuilder()
            .setTitle(selectedGame.name)
            .setDescription(selectedGame.description)
            .setColor('#00ff00')
            .addFields(
                { name: '📝 How to Play', value: selectedGame.howToPlay },
                { name: '💻 Commands', value: selectedGame.commands.map(c => `\`${c}\``).join('\n') }
            )
            .setFooter({ text: 'Select another game to view info' });

        await i.update({ embeds: [newEmbed] });
    });

    collector.on('end', () => {
        // Disable component after timeout
        const disabledRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu.setDisabled(true));

        interaction.editReply({ components: [disabledRow] }).catch(() => { });
    });
}
