import { Client, ChatInputCommandInteraction, EmbedBuilder, Message, TextChannel, MessageFlags } from 'discord.js';
import { ReverseCanvas } from './reverseCanvas';

interface ReverseGameState {
    channelId: string;
    originalText: string;
    reversedText: string;
    isActive: boolean;
    startTime: number;
    difficulty: string;
    amount: number;
    displayTime: number;
    starterId: string;
}

export class ReverseGameManager {
    private activeGames: Map<string, ReverseGameState> = new Map();
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private generateText(difficulty: string, count: number): string {
        const wordsList = [
            // Complex & Long Words
            'Incomprehensibilities', 'Characteristically', 'Unconstitutionally', 'Disproportionateness',
            'Pneumonoultramicroscopicsilicovolcanoconiosis', 'Hippopotomonstrosesquippedaliophobia',
            'Supercalifragilisticexpialidocious', 'Antidisestablishmentarianism', 'Honorificabilitudinitatibus',
            'Floccinaucinihilipilification', 'Pseudopseudohypoparathyroidism', 'Psychoneuroimmunology',
            'Otorhinolaryngological', 'Thyroparathyroidectomized', 'Radioimmunoelectrophoresis',
            'Spectrophotofluorometrically', 'Hepaticojejunostomy', 'Diaminomonocarboxylic',
            'Anencephalotrophia', 'Cholecystoduodenostomy', 'Dichlorodiphenyltrichloroethane',
            'Methionylthreonylthreonylglutaminylarginyl', 'Aequeosalinocalcalinoceraceoaluminosocupreovitriolic',

            // Confusing / Repetitive Letters
            'Mississippi', 'Bookkeeper', 'Committee', 'Successlessness', 'Assessment', 'Occurrence',
            'Embarrassment', 'Millennium', 'Accommodation', 'Questionnaire', 'Unnecessary',
            'Consciousness', 'Maintenance', 'Pronunciation', 'Mischievous', 'Parliament',
            'Guarantee', 'Caribbean', 'Rhythm', 'Queue', 'Phlegm', 'Twelfth', 'Sixth',
            'Aggressive', 'Possession', 'Supposedly', 'Hemorrhage', 'Lieutenant', 'Colonel',
            'Squirrel', 'Successful', 'Accessory', 'Accidentally', 'Bureaucracy',

            // Academic / Formal
            'Epistemology', 'Existentialism', 'Phenomenology', 'Deconstructivism',
            'Ontological', 'Hermeneutics', 'Metaphysical', 'Theoretical', 'Hypothetical',
            'Empirical', 'Quantitative', 'Qualitative', 'Methodology', 'Paradigm',
            'Jurisprudence', 'Legislature', 'Constituency', 'Referendum', 'Sovereignty',
            'Bureaucratic', 'Administrative', 'Organizational', 'Infrastructure',
            'Globalization', 'Multiculturalism', 'Sustainability', 'Biodiversity',

            // Scientific
            'Photosynthesis', 'Mitochondria', 'Chlorophyll', 'Chromosome', 'Nucleotide',
            'Gravitational', 'Electromagnetic', 'Thermodynamics', 'Quantum', 'Relativity',
            'Microbiology', 'Astrophysics', 'Biochemistry', 'Neuroscience', 'Paleontology',
            'Oceanography', 'Meteorology', 'Seismology', 'Volcanology', 'Geology',

            // General Hard Words
            'Aberration', 'Acquiesce', 'Alacrity', 'Amiable', 'Appease', 'Arcane',
            'Avarice', 'Brazen', 'Brusque', 'Cajole', 'Callous', 'Candor', 'Chide',
            'Circumspect', 'Clandestine', 'Coerce', 'Coherent', 'Complacency', 'Confidant',
            'Connive', 'Cumulative', 'Debase', 'Decry', 'Deference', 'Demure', 'Deride',
            'Despot', 'Diligent', 'Elated', 'Eloquent', 'Embezzle', 'Empathy', 'Enmity',
            'Erudite', 'Extol', 'Fabricate', 'Feral', 'Flabbergasted', 'Forsake',
            'Fractious', 'Gluttony', 'Gratuitous', 'Haughty', 'Hypocrisy', 'Impeccable',
            'Impertinent', 'Implacable', 'Impudent', 'Incisive', 'Indolent', 'Inept',
            'Infamy', 'Inhibit', 'Innate', 'Insatiable', 'Insular', 'Intrepid',
            'Inveterate', 'Jubilant', 'Judicious', 'Knell', 'Kudos', 'Larceny',
            'Lethargic', 'Lithe', 'Lurid', 'Maverick', 'Maxim', 'Meticulous',
            'Modicum', 'Morose', 'Myriad', 'Nadir', 'Nominal', 'Novice', 'Nuance',
            'Oblivious', 'Obsequious', 'Obtuse', 'Panacea', 'Parody', 'Penchant',
            'Perusal', 'Plethora', 'Predilection', 'Quaint', 'Rash', 'Refurbish',
            'Repudiate', 'Rife', 'Salient', 'Serendipity', 'Staid', 'Superfluous',
            'Sycophant', 'Taciturn', 'Truculent', 'Umbrage', 'Venerable', 'Vex',
            'Vociferous', 'Wanton', 'Zenith'
        ];

        let minLen = 8;
        let maxLen = 12;

        // Difficulty Calibration (Much Harder)
        if (difficulty === 'Easy') {
            // Even Easy is hard now
            minLen = 8;
            maxLen = 12;
        }
        if (difficulty === 'Medium') {
            minLen = 12;
            maxLen = 16;
        }
        if (difficulty === 'Hard') {
            // Hardest words
            minLen = 16;
            maxLen = 100;
        }

        let filteredWords = wordsList.filter(w => w.length >= minLen && w.length <= maxLen);

        // Fallback if specific length not found (shouldn't happen with this list but safety)
        if (filteredWords.length === 0) {
            // Sort by length to pick appropriately
            const sorted = [...wordsList].sort((a, b) => a.length - b.length);
            if (difficulty === 'Hard') filteredWords = sorted.slice(-20);
            else if (difficulty === 'Medium') filteredWords = sorted.slice(sorted.length / 2 - 20, sorted.length / 2 + 20);
            else filteredWords = sorted.slice(0, 50);
        }

        const selectedWords: string[] = [];
        for (let i = 0; i < count; i++) {
            selectedWords.push(filteredWords[Math.floor(Math.random() * filteredWords.length)]);
        }
        return selectedWords.join(' ');
    }

    public async startGame(interaction: ChatInputCommandInteraction, difficulty: string, time: number, count: number): Promise<boolean> {
        const channelId = interaction.channelId;
        if (this.activeGames.has(channelId)) {
            return false;
        }

        const text = this.generateText(difficulty, count);
        const reversed = text.split('').reverse().join('');


        const guildName = interaction.guild?.name || 'Raw Games';
        const guildIconUrl = interaction.guild?.iconURL({ extension: 'png' }) || null;

        // DECIPHER MODE: Image shows REVERSED text, Answer is ORIGINAL text
        const attachment = await ReverseCanvas.generateImage(reversed, guildName, guildIconUrl);

        const embed = new EmbedBuilder()
            .setTitle('Reverse the Word')
            .setDescription(`**Decipher the reversed word. You have ${time > 0 ? time + 's' : 'unlimited time'} to view.**\n\n**Type the original word. First exact match wins.**`) // Updated instruction
            .setImage('attachment://reverse_challenge.png')
            .setColor('#0099ff');

        await interaction.reply({
            embeds: [embed],
            files: [attachment]
        });


        try {
            await interaction.user.send(`Your answer: || ${text} ||`); // Send ORIGINAL text as answer
        } catch (e) {
            await interaction.followUp({ content: 'Couldn’t DM answer — enable DMs.', flags: MessageFlags.Ephemeral });
        }

        const gameState: ReverseGameState = {
            channelId,
            originalText: text,
            reversedText: reversed, // Store ACTUAL reversed text
            isActive: true,
            startTime: Date.now(),
            difficulty,
            amount: count,
            displayTime: time,
            starterId: interaction.user.id
        };

        this.activeGames.set(channelId, gameState);

        if (time > 0) {
            setTimeout(async () => {
                try {

                    if (!this.activeGames.has(channelId)) return;

                    if (interaction.channel) {
                        const timeUpEmbed = new EmbedBuilder()
                            .setTitle('Time Up!')
                            .setDescription(`The time is up! The correct answer was: **${text}**`)
                            .setColor('#ff0000');

                        if (interaction.channel.isTextBased() && !(interaction.channel as any).isDMBased()) {
                            await (interaction.channel as TextChannel).send({ embeds: [timeUpEmbed] });
                        }
                    }

                    await interaction.deleteReply();
                    this.activeGames.delete(channelId);
                } catch (error) {
                    console.error('Error in Reverse Game timeout:', error);

                }
            }, time * 1000);
        }

        return true;
    }

    public async stopGame(interaction: ChatInputCommandInteraction): Promise<boolean> {
        const channelId = interaction.channelId;
        const game = this.activeGames.get(channelId);

        if (!game) {
            return false;
        }

        if (!interaction.memberPermissions?.has('ManageGuild') && interaction.user.id !== game.starterId) {
            return false;
        }

        const answer = game.originalText; // Answer is ORIGINAL text
        this.activeGames.delete(channelId);

        const embed = new EmbedBuilder()
            .setTitle('Game Ended')
            .setDescription(`Game ended. Correct answer: ${answer}`)
            .setColor('#ff0000');

        const channel = interaction.channel;
        if (channel) {
            if (channel.isTextBased() && !(channel as any).isDMBased()) {
                await (channel as TextChannel).send({ embeds: [embed] });
            }
        }

        return true;
    }

    public async handleMessage(message: Message) {
        const game = this.activeGames.get(message.channelId);
        if (!game || !game.isActive || message.author.bot) return;

        const content = message.content.trim();


        if (content.toLowerCase() === game.originalText.toLowerCase()) { // Check against ORIGINAL text
            game.isActive = false;
            this.activeGames.delete(message.channelId);

            await message.react('✅');

            const timeTaken = ((Date.now() - game.startTime) / 1000);

            const embed = new EmbedBuilder()
                .setTitle('Sentence Reverse — Winner!')
                .addFields(
                    { name: 'Winner', value: `<@${message.author.id}>`, inline: true },
                    { name: 'Original (Answer)', value: game.originalText, inline: true },
                    { name: 'Image Text', value: game.reversedText, inline: true },
                    { name: 'Difficulty', value: game.difficulty, inline: true },
                    { name: 'Time taken', value: `${timeTaken.toFixed(2)}s`, inline: false }
                )
                .setFooter({ text: 'Quick Reverse Challenge' })
                .setColor('#00ff00');

            if (message.channel.isTextBased() && !(message.channel as any).isDMBased()) {
                await (message.channel as TextChannel).send({ embeds: [embed] });
            } else if ((message.channel as any).isDMBased()) {
                await (message.channel as any).send({ embeds: [embed] });
            }
        }
    }
}

let instance: ReverseGameManager;

export const getReverseGameManager = (client: Client) => {
    if (!instance) {
        instance = new ReverseGameManager(client);
    }
    return instance;
};
