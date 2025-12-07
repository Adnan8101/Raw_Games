import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';

export class VowelsCanvas {
    public static async generateImage(text: string, guildName: string, guildIconUrl: string | null): Promise<AttachmentBuilder> {
        const width = 800;
        const height = 300;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Complex Background
        ctx.fillStyle = '#2b2d31';
        ctx.fillRect(0, 0, width, height);

        // Background noise
        for (let i = 0; i < 1500; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#383a40' : '#1e1f22';
            const x = Math.random() * width;
            const y = Math.random() * height;
            const s = Math.random() * 3;
            ctx.fillRect(x, y, s, s);
        }

        // Ghost text
        ctx.font = 'bold 45px "Times New Roman", serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(Math.random() * width, Math.random() * height);
            ctx.rotate(Math.random() - 0.5);
            ctx.fillText(Math.random().toString(36).substring(7), 0, 0);
            ctx.restore();
        }

        // 2. Main Text Rendering
        let fontSize = 70;
        ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate total width with explicit spacing
        const letterSpacing = 10;
        let totalWidth = 0;
        const chars = text.split('');

        for (const char of chars) {
            totalWidth += ctx.measureText(char).width + letterSpacing;
        }
        if (chars.length > 0) totalWidth -= letterSpacing;

        // Auto-scale with safer margins
        if (totalWidth > width - 120) {
            const scale = (width - 120) / totalWidth;
            fontSize = Math.floor(fontSize * scale);
            ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        }

        // Recalculate width for centering
        totalWidth = 0;
        for (const char of chars) {
            totalWidth += ctx.measureText(char).width + letterSpacing;
        }
        if (chars.length > 0) totalWidth -= letterSpacing;

        const startY = height / 2;
        let currentX = (width - totalWidth) / 2;

        chars.forEach((char, i) => {
            const charWidth = ctx.measureText(char).width;

            ctx.save();

            // Minimal Jitter
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetY = (Math.random() - 0.5) * 6;

            ctx.translate(currentX + charWidth / 2 + offsetX, startY + offsetY);

            // Gentler Scale & Rotate
            const scaleX = 0.95 + Math.random() * 0.1;
            const scaleY = 0.95 + Math.random() * 0.1;
            ctx.scale(scaleX, scaleY);

            const angle = (Math.random() - 0.5) * 0.2;
            ctx.rotate(angle);

            // Max Contrast
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = '#ffffff';

            ctx.fillText(char, 0, 0);
            ctx.restore();

            // Explicit Spacing
            currentX += charWidth + letterSpacing;
        });


        // 3. Obstructions

        // Thinner Cuts
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2b2d31';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Thinner Interference
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(0, Math.random() * height);
            ctx.bezierCurveTo(
                width / 3, Math.random() * height,
                2 * width / 3, Math.random() * height,
                width, Math.random() * height
            );
            ctx.stroke();
        }

        // 4. Branding / Watermarks
        try {
            const padding = 20;
            const iconSize = 40;
            const fontSize = 24;

            // TOP LEFT: [Raw Icon] [Raw Studio]
            const rawIconUrl = 'https://cdn.discordapp.com/icons/1114156524311412857/f1fbaaa11d8f29a8b1191bc50fa6f394.png';
            const rawIcon = await loadImage(rawIconUrl);
            ctx.drawImage(rawIcon, padding, padding, iconSize, iconSize);

            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.fillText('Raw Studio', padding + iconSize + 10, padding + iconSize / 2);

            // TOP RIGHT: [Guild Name] [Guild Icon]
            let rightOffset = padding;

            if (guildIconUrl) {
                try {
                    const guildIcon = await loadImage(guildIconUrl);
                    ctx.drawImage(guildIcon, width - padding - iconSize, padding, iconSize, iconSize);
                    rightOffset += iconSize + 10;
                } catch (e) {
                    console.error('Failed to load guild icon', e);
                }
            }

            ctx.textAlign = 'right';
            ctx.fillText(guildName, width - rightOffset, padding + iconSize / 2);

        } catch (error) {
            console.error('Failed to render watermarks:', error);
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(guildName, width - 20, 30);
        }

        return new AttachmentBuilder(canvas.toBuffer(), { name: 'vowels_challenge.png' });
    }
}
