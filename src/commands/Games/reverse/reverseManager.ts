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
            // Animals
            'aardvark', 'albatross', 'alligator', 'alpaca', 'ant', 'anteater', 'antelope', 'ape', 'armadillo', 'baboon', 'badger', 'barracuda', 'bat', 'bear', 'beaver', 'bee', 'bison', 'boar', 'buffalo', 'butterfly', 'camel', 'capybara', 'caribou', 'cat', 'caterpillar', 'cattle', 'chamois', 'cheetah', 'chicken', 'chimpanzee', 'chinchilla', 'clam', 'cobra', 'cockroach', 'cod', 'cormorant', 'coyote', 'crab', 'crane', 'crocodile', 'crow', 'curlew', 'deer', 'dinosaur', 'dog', 'dogfish', 'dolphin', 'donkey', 'dotterel', 'dove', 'dragonfly', 'duck', 'dugong', 'dunlin', 'eagle', 'echidna', 'eel', 'eland', 'elephant', 'elk', 'emu', 'falcon', 'ferret', 'finch', 'fish', 'flamingo', 'fly', 'fox', 'frog', 'gaur', 'gazelle', 'gerbil', 'giraffe', 'gnat', 'gnu', 'goat', 'goldfinch', 'goldfish', 'goose', 'gorilla', 'goshawk', 'grasshopper', 'grouse', 'guanaco', 'gull', 'hamster', 'hare', 'hawk', 'hedgehog', 'heron', 'herring', 'hippo', 'hornet', 'horse', 'human', 'hummingbird', 'hyena', 'ibex', 'ibis', 'jackal', 'jaguar', 'jay', 'jellyfish', 'kangaroo', 'kingfisher', 'koala', 'kookaburra', 'kouprey', 'kudu', 'lapwing', 'lark', 'lemur', 'leopard', 'lion', 'llama', 'lobster', 'locust', 'loris', 'louse', 'lyrebird', 'magpie', 'mallard', 'manatee', 'mandrill', 'mantis', 'marten', 'meerkat', 'mink', 'mole', 'mongoose', 'monkey', 'moose', 'mosquito', 'mouse', 'mule', 'narwhal', 'newt', 'nightingale', 'octopus', 'okapi', 'opossum', 'oryx', 'ostrich', 'otter', 'owl', 'oyster', 'panther', 'parrot', 'partridge', 'peafowl', 'pelican', 'penguin', 'pheasant', 'pig', 'pigeon', 'pony', 'porcupine', 'porpoise', 'quail', 'quelea', 'quetzal', 'rabbit', 'raccoon', 'rail', 'ram', 'rat', 'raven', 'red deer', 'red panda', 'reindeer', 'rhinoceros', 'rook', 'salamander', 'salmon', 'sand dollar', 'sandpiper', 'sardine', 'scorpion', 'seahorse', 'seal', 'shark', 'sheep', 'shrew', 'skunk', 'snail', 'snake', 'sparrow', 'spider', 'spoonbill', 'squid', 'squirrel', 'starling', 'stingray', 'stinkbug', 'stork', 'swallow', 'swan', 'tapir', 'tarsier', 'termite', 'tiger', 'toad', 'trout', 'turkey', 'turtle', 'viper', 'vulture', 'wallaby', 'walrus', 'wasp', 'weasel', 'whale', 'wildcat', 'wolf', 'wolverine', 'wombat', 'woodcock', 'woodpecker', 'worm', 'wren', 'yak', 'zebra',
            // Fruits & Veg
            'apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blackcurrant', 'blueberry', 'boysenberry', 'cherry', 'coconut', 'cranberry', 'cucumber', 'currant', 'damson', 'date', 'dragonfruit', 'durian', 'elderberry', 'fig', 'grape', 'grapefruit', 'guava', 'huckleberry', 'jackfruit', 'jambul', 'jujube', 'kiwi', 'kumquat', 'lemon', 'lime', 'loquat', 'lychee', 'mango', 'melon', 'mulberry', 'nectarine', 'nut', 'olive', 'orange', 'papaya', 'passionfruit', 'peach', 'pear', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'pomelo', 'prune', 'quince', 'raisin', 'raspberry', 'redcurrant', 'star fruit', 'strawberry', 'tangerine', 'tomato', 'watermelon', 'asparagus', 'bean', 'beetroot', 'broccoli', 'brussels sprout', 'cabbage', 'carrot', 'cauliflower', 'celery', 'chard', 'chicory', 'corn', 'cucumber', 'eggplant', 'endive', 'fennel', 'garlic', 'ginger', 'kale', 'leek', 'lettuce', 'mushroom', 'onion', 'parsley', 'parsnip', 'pea', 'pepper', 'potato', 'pumpkin', 'radish', 'rhubarb', 'spinach', 'squash', 'turnip', 'watercress', 'yam', 'zucchini',
            // Colors
            'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'purple', 'magenta', 'cyan', 'pink', 'brown', 'white', 'gray', 'black', 'gold', 'silver', 'bronze', 'copper', 'maroon', 'navy', 'olive', 'teal', 'lime', 'aqua', 'beige', 'coral', 'crimson', 'fuchsia', 'ivory', 'khaki', 'lavender', 'lilac', 'mauve', 'ochre', 'peach', 'plum', 'puce', 'salmon', 'sepia', 'tan', 'turquoise',
            // Objects/Tech
            'computer', 'laptop', 'keyboard', 'mouse', 'screen', 'monitor', 'printer', 'scanner', 'speaker', 'headphone', 'microphone', 'camera', 'phone', 'tablet', 'battery', 'charger', 'cable', 'wire', 'plug', 'socket', 'switch', 'bulb', 'lamp', 'light', 'fan', 'heater', 'cooler', 'fridge', 'oven', 'stove', 'microwave', 'toaster', 'blender', 'Mixer', 'juicer', 'kettle', 'pot', 'pan', 'dish', 'plate', 'cup', 'glass', 'fork', 'spoon', 'knife', 'bowl', 'tray', 'bucket', 'broom', 'mop', 'brush', 'comb', 'soap', 'shampoo', 'paste', 'towel', 'cloth', 'paper', 'pen', 'pencil', 'book', 'notebook', 'diary', 'calendar', 'clock', 'watch', 'alarm', 'radio', 'video', 'audio', 'music', 'song', 'movie', 'game', 'toy', 'doll', 'ball', 'bat', 'net', 'car', 'bus', 'truck', 'van', 'bike', 'cycle', 'scooter', 'boat', 'ship', 'plane', 'jet', 'train', 'tram', 'metro', 'taxi', 'cab', 'road', 'street', 'lane', 'path', 'way', 'bridge', 'tunnel', 'house', 'home', 'flat', 'room', 'wall', 'floor', 'roof', 'door', 'window', 'gate', 'fence', 'garden', 'park', 'shop', 'mall', 'market', 'bank', 'office', 'school', 'college', 'hospital', 'clinic', 'pharmacy', 'hotel', 'restaurant', 'cafe', 'bar', 'club', 'gym', 'pool', 'stadium', 'theater', 'cinema', 'museum', 'library', 'church', 'temple', 'mosque',
            // Abstract & Verbs
            'run', 'jump', 'walk', 'talk', 'sleep', 'dream', 'eat', 'drink', 'laugh', 'cry', 'smile', 'frown', 'love', 'hate', 'like', 'dislike', 'hope', 'fear', 'joy', 'sadness', 'anger', 'peace', 'war', 'fight', 'help', 'hurt', 'pain', 'pleasure', 'work', 'play', 'rest', 'study', 'learn', 'teach', 'read', 'write', 'draw', 'paint', 'sing', 'dance', 'cook', 'clean', 'wash', 'drive', 'fly', 'swim', 'sail', 'travel', 'visit', 'meet', 'greet', 'say', 'tell', 'ask', 'answer', 'think', 'feel', 'know', 'understand', 'believe', 'doubt', 'guess', 'imagine', 'create', 'destroy', 'build', 'break', 'fix', 'mend', 'buy', 'sell', 'pay', 'cost', 'save', 'spend', 'give', 'take', 'get', 'lose', 'find', 'keep', 'hold', 'drop', 'lift', 'push', 'pull', 'throw', 'catch', 'hit', 'miss', 'win', 'lose', 'start', 'stop', 'begin', 'end', 'open', 'close', 'enter', 'exit', 'go', 'come', 'stay', 'leave', 'live', 'die', 'born', 'grow', 'change', 'move', 'turn', 'spin', 'roll', 'slide', 'fall', 'rise', 'stand', 'sit', 'lie', 'kneel', 'bow', 'clap', 'wave', 'nod', 'shake', 'point', 'touch', 'see', 'look', 'watch', 'hear', 'listen', 'sound', 'smell', 'taste', 'feel'
        ];

        let minLen = 3;
        let maxLen = 5;
        if (difficulty === 'Medium') { minLen = 5; maxLen = 8; }
        if (difficulty === 'Hard') { minLen = 8; maxLen = 15; }

        let filteredWords = wordsList.filter(w => w.length >= minLen && w.length <= maxLen);
        if (filteredWords.length === 0) filteredWords = wordsList;

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


        const attachment = await ReverseCanvas.generateImage(text);

        const embed = new EmbedBuilder()
            .setTitle('Reverse the Word')
            .setDescription(`**Reverse the word. You have ${time > 0 ? time + 's' : 'unlimited time'} to view.**\n\n**Type the word reversed. First exact match wins.**`)
            .setImage('attachment://reverse_challenge.png')
            .setColor('#0099ff');

        await interaction.reply({
            embeds: [embed],
            files: [attachment]
        });


        try {
            await interaction.user.send(`Your answer: || ${reversed} ||`);
        } catch (e) {
            await interaction.followUp({ content: 'Couldn’t DM answer — enable DMs.', flags: MessageFlags.Ephemeral });
        }

        const gameState: ReverseGameState = {
            channelId,
            originalText: text,
            reversedText: reversed,
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
                            .setDescription(`The time is up! The correct answer was: **${reversed}**`)
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

        const answer = game.reversedText;
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


        if (content.toLowerCase() === game.reversedText.toLowerCase()) {
            game.isActive = false;
            this.activeGames.delete(message.channelId);

            await message.react('✅');

            const timeTaken = ((Date.now() - game.startTime) / 1000);

            const embed = new EmbedBuilder()
                .setTitle('Sentence Reverse — Winner!')
                .addFields(
                    { name: 'Winner', value: `<@${message.author.id}>`, inline: true },
                    { name: 'Original', value: game.originalText, inline: true },
                    { name: 'Reversed', value: game.reversedText, inline: true },
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
