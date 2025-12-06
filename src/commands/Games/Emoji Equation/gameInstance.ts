import { Client, Message, EmbedBuilder, TextChannel, AttachmentBuilder } from 'discord.js';
import { createCanvas, registerFont, loadImage, Image } from 'canvas';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
    channelId: string;
    difficulty: Difficulty;
    targetAnswer: number;
    startTime: number;
    isActive: boolean;
    hostId: string;
}

export class EmojiEquationGameManager {
    private activeGames: Map<string, GameState> = new Map();
    private client: Client;


    private emojiPool = [
        '🍎', '🍌', '🍇', '🍉', '🍒', '🍓', '🍍', '🥝', '🥑', '🍆', '🥕', '🌽', '🥦', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥞', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯',
        '🍋', '🍊', '🍐', '🍑', '🥭', '🥥', '🥔', '🧄', '🧅', '🥗', '🍿', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡',
        '🍪', '🍩', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊',
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
        '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫',
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘',
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚊', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎', '🏍', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣', '🛤', '🛢', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧',
        '⚓', '⛵', '🛶', '🚤', '🛳', '⛴', '🛥', '🚢', '✈', '🛩', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰', '🚀', '🛸', '🛎', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱', '⏲', '🕰', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦'
    ];

    constructor(client: Client) {
        this.client = client;
    }

    public async startGame(channelId: string, difficulty: Difficulty, hostId: string, time?: number): Promise<boolean> {
        if (this.activeGames.has(channelId)) {
            return false;
        }

        const { equations, answer, emojis, values } = this.generateEquations(difficulty);

        const gameState: GameState = {
            channelId,
            difficulty,
            targetAnswer: answer,
            startTime: Date.now(),
            isActive: true,
            hostId
        };

        this.activeGames.set(channelId, gameState);

        const buffer = await this.renderGame(equations);
        const attachment = new AttachmentBuilder(buffer, { name: 'equation.png' });

        const channel = await this.client.channels.fetch(channelId) as TextChannel;
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('Emoji Equation')
                .setDescription(`**Difficulty:** ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}\n\nSolve the final equation! First correct answer wins.\n\n**Type the missing term (number only). First correct answer wins.**`)
                .setImage('attachment://equation.png')
                .setColor('#0099ff')
                .setFooter({ text: 'Type the number to answer!' });

            const msg = await channel.send({ embeds: [embed], files: [attachment] });


            try {
                const host = await this.client.users.fetch(hostId);
                await host.send(`**Emoji Equation Answer:** ||${answer}||`);
            } catch (e) {
                console.error('Failed to DM host:', e);
            }

            if (time && time > 0) {
                setTimeout(async () => {
                    if (this.activeGames.has(channelId) && this.activeGames.get(channelId)?.isActive) {
                        try {
                            await msg.delete();
                            await channel.send('Time is up! The image has been deleted. You can still answer.');
                        } catch (e) { }
                    }
                }, time * 1000);
            }
        }

        return true;
    }

    public async stopGame(channelId: string): Promise<number | null> {
        const game = this.activeGames.get(channelId);
        if (!game) return null;

        const answer = game.targetAnswer;
        this.activeGames.delete(channelId);
        return answer;
    }

    public async handleMessage(message: Message) {
        const game = this.activeGames.get(message.channelId);
        if (!game || !game.isActive || message.author.bot) return;

        const guess = parseInt(message.content.trim());
        if (isNaN(guess)) return;

        if (guess === game.targetAnswer) {
            game.isActive = false;
            await message.react('✅');

            const embed = new EmbedBuilder()
                .setTitle('🎉 Correct Answer!')
                .setDescription(`**Winner:** ${message.author}\n**Correct Answer:** ${game.targetAnswer}\n**Difficulty:** ${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}`)
                .setColor('#00ff00');

            await (message.channel as TextChannel).send({ embeds: [embed] });
            this.activeGames.delete(message.channelId);
        }
    }

    private generateEquations(difficulty: Difficulty) {
        let numEmojis = 3;
        let numEquations = 3;
        let allowedOps = ['+'];
        let answerMin = 10;
        let answerMax = 20;

        // Difficulty Settings
        if (difficulty === 'medium') {
            numEmojis = 3; // Keep to 3 variables for solvable flow (A, B, C) usually sufficient
            numEquations = 3; // Eq1(A), Eq2(A,B), Eq3(Final) or Eq1(A), Eq2(B), Eq3(C), Eq4(Final)?
            // Let's stick to standard 3-variable puzzle:
            // 1. A + A = X
            // 2. A + B = Y
            // 3. A + B - C = Z
            // 4. A + B + C ?
            numEquations = 4;
            allowedOps = ['+', '-'];
            answerMin = 30;
            answerMax = 70;
        } else if (difficulty === 'hard') {
            numEmojis = 4;
            numEquations = 5;
            allowedOps = ['+', '-', '*'];
            answerMin = 80;
            answerMax = 140;
        }

        // Retry loop to ensure constraints (Answer Range)
        let bestResult = null;
        let attempts = 0;

        while (attempts < 200) {
            attempts++;

            // 1. Select Emojis
            const shuffledEmojis = [...this.emojiPool].sort(() => 0.5 - Math.random());
            const selectedEmojis = shuffledEmojis.slice(0, numEmojis);

            // 2. Assign Values
            // For Hard mode, we need higher numbers to reach 140 with small term counts if we don't multiply.
            // But we have multiplication in Hard.
            const values: Record<string, number> = {};
            const maxVal = difficulty === 'hard' ? 30 : (difficulty === 'medium' ? 20 : 10);
            selectedEmojis.forEach(e => values[e] = Math.floor(Math.random() * maxVal) + 1);

            const equations: string[] = [];

            // Helper to build equation string and value
            // We want to generate equations that INTRODUCE variable i at step i.

            // e.g. E0 + E0 + E0 = X
            let validSystem = true;

            for (let i = 0; i < numEmojis; i++) {
                // Determine which emojis are "known" or "available" for this line.
                // Progressive Cascade STRICT Solvability:
                // Line 0: Uses ONLY Emoji 0. Force (+) to prevent A-A=0.
                // Line i > 0: Uses ONE instance of Emoji i, and multiple instances of E_0..E_{i-1}.

                const terms: string[] = [];
                const ops: string[] = [];
                let currentVal = 0;

                const termCount = Math.floor(Math.random() * 2) + 2;

                if (i === 0) {
                    // Line 0: Define E_0
                    // e.g. A + A = Val.
                    for (let k = 0; k < termCount; k++) {
                        terms.push(selectedEmojis[0]);
                    }
                    // Generate Ops (Only + or * to prevent cancellation)
                    let mathStr = values[terms[0]].toString();
                    for (let k = 0; k < termCount - 1; k++) {
                        // In Hard mode, maybe *? But + is safest and clearest. 
                        // Let's allow * only if Hard.
                        const safeOps = difficulty === 'hard' ? ['+', '*'] : ['+'];
                        const op = safeOps[Math.floor(Math.random() * safeOps.length)];
                        ops.push(op);
                        mathStr += ` ${op} ${values[terms[k + 1]]}`;
                    }

                    try {
                        currentVal = new Function(`return ${mathStr}`)();
                    } catch (e) { currentVal = 0; }

                } else {
                    // Line i: Define E_i using E_0..E_{i-1}
                    // MUST contain exactly ONE E_i.

                    // 1. Add E_i
                    terms.push(selectedEmojis[i]);

                    // 2. Add other terms from known
                    const knownEmojis = selectedEmojis.slice(0, i);
                    for (let k = 1; k < termCount; k++) {
                        terms.push(knownEmojis[Math.floor(Math.random() * knownEmojis.length)]);
                    }

                    // 3. Shuffle terms so E_i isn't always first
                    // Fisher-Yates shuffle
                    for (let k = terms.length - 1; k > 0; k--) {
                        const j = Math.floor(Math.random() * (k + 1));
                        [terms[k], terms[j]] = [terms[j], terms[k]];
                    }

                    // 4. Generate Ops (Any allowed op is fine now since E_i is unique, it won't cancel with itself)
                    // But we must compute the result.
                    let mathStr = values[terms[0]].toString();
                    for (let k = 0; k < termCount - 1; k++) {
                        const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
                        ops.push(op);
                        mathStr += ` ${op} ${values[terms[k + 1]]}`;
                    }

                    try {
                        currentVal = new Function(`return ${mathStr}`)();
                    } catch (e) { currentVal = 0; }
                }

                // Reconstruct string for display
                let builtEq = terms[0];
                for (let k = 0; k < ops.length; k++) {
                    builtEq += ` ${ops[k]} ${terms[k + 1]}`;
                }
                builtEq += ` = ${currentVal}`;
                equations.push(builtEq);
            }

            // Now we have 'numEmojis' equations defined (solving for all emojis).
            // We need 'numEquations' lines. 
            // If numEquations > numEmojis, we add extra lines (distractors or reinforcements).
            // Currently numEquations matches numEmojis basically (3 vs 3, 4 vs 4).
            // If numEquations > numEmojis (e.g. Medium 4 eqs for 4 emojis? Step 226 set numEmojis=4, numEquations=4).
            // So we are covered. 

            // Generate the Final Equation
            const finalTerms: string[] = [];
            const finalOps: string[] = [];

            // Should be reasonably complex.
            const finalTermCount = difficulty === 'hard' ? 4 : 3;

            // Use ANY emoji from pool (fully mixed)
            finalTerms.push(selectedEmojis[Math.floor(Math.random() * numEmojis)]);
            let finalMathStr = values[finalTerms[0]].toString();

            for (let k = 0; k < finalTermCount - 1; k++) {
                const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
                const nextEmoji = selectedEmojis[Math.floor(Math.random() * numEmojis)];
                const nextVal = values[nextEmoji];

                finalOps.push(op);
                finalTerms.push(nextEmoji);

                finalMathStr += ` ${op} ${nextVal}`;
            }

            let finalAns = 0;
            try {
                finalAns = new Function(`return ${finalMathStr}`)();
            } catch (e) {
                finalAns = 0;
            }

            // Check Range
            if (finalAns < answerMin || finalAns > answerMax) continue;

            // Check Uniqueness of Final Equation LEFT SIDE
            // Construct string
            let finalEqStr = finalTerms[0];
            for (let k = 0; k < finalOps.length; k++) {
                finalEqStr += ` ${finalOps[k]} ${finalTerms[k + 1]}`;
            }
            const existingLeftSides = equations.map(eq => eq.split(' = ')[0]);
            if (existingLeftSides.includes(finalEqStr)) continue;

            finalEqStr += ` = ?`;
            equations.push(finalEqStr);

            // Success
            bestResult = { equations, answer: finalAns, emojis: selectedEmojis, values };
            break;
        }

        if (bestResult) return bestResult;

        // Fallback if loop fails (should rarely happen with 200 attempts)
        // Return a simple safety fallback
        const safetyValue = 15;
        const e = this.emojiPool[0];
        return {
            equations: [`${e} + ${e} = 10`, `${e} + ${e} + ${e} = ?`],
            answer: 15,
            emojis: [e],
            values: { [e]: 5 }
        };
    }

    private getEmojiUrl(emoji: string): string {
        const codePoint = emoji.codePointAt(0)?.toString(16);
        return `https://twemoji.maxcdn.com/v/latest/72x72/${codePoint}.png`;
    }

    private async renderGame(equations: string[]): Promise<Buffer> {
        const width = 800;
        const lineHeight = 100;
        const height = 100 + (equations.length * lineHeight);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');


        ctx.fillStyle = '#2f3136';
        ctx.fillRect(0, 0, width, height);


        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let y = 100;

        for (const eq of equations) {

            const parts = eq.split(' ');


            let totalWidth = 0;
            const elementWidths: number[] = [];
            const elementImages: (Image | null)[] = [];
            const spacing = 25;

            for (const part of parts) {
                if (this.emojiPool.includes(part)) {

                    try {
                        const img = await loadImage(this.getEmojiUrl(part));
                        elementImages.push(img);
                        elementWidths.push(72);
                    } catch (e) {
                        console.error(`Failed to load emoji: ${part}`, e);

                        elementImages.push(null);
                        const textWidth = ctx.measureText(part).width;
                        elementWidths.push(textWidth);
                    }
                } else {

                    elementImages.push(null);
                    const textWidth = ctx.measureText(part).width;
                    elementWidths.push(textWidth);
                }
                totalWidth += elementWidths[elementWidths.length - 1];
            }


            totalWidth += (parts.length - 1) * spacing;


            let currentX = (width - totalWidth) / 2;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const img = elementImages[i];
                const w = elementWidths[i];

                if (img) {

                    ctx.drawImage(img, currentX, y - 36, 72, 72);
                } else {

                    ctx.fillText(part, currentX + (w / 2), y + 5);
                }

                currentX += w + spacing;
            }

            y += lineHeight;
        }

        return canvas.toBuffer();
    }
}

let gameManager: EmojiEquationGameManager | null = null;

export const getEmojiEquationManager = (client: Client) => {
    if (!gameManager) {
        gameManager = new EmojiEquationGameManager(client);
    }
    return gameManager;
};
