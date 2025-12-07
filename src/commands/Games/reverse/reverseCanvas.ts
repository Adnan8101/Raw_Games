import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';

export class ReverseCanvas {
    public static async generateImage(text: string, guildName: string, guildIconUrl: string | null): Promise<AttachmentBuilder> {
        const width = 800;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Complex Background (Dark but cleaner)
        ctx.fillStyle = '#2b2d31';
        ctx.fillRect(0, 0, width, height);

        // Background noise (finer dots)
        for (let i = 0; i < 1500; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#383a40' : '#1e1f22';
            const x = Math.random() * width;
            const y = Math.random() * height;
            const s = Math.random() * 3; // Smaller dots
            ctx.fillRect(x, y, s, s);
        }

        // Ghost text (More subtle)
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'; // Very faint
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(Math.random() * width, Math.random() * height);
            ctx.rotate(Math.random() - 0.5);
            ctx.fillText(Math.random().toString(36).substring(7), 0, 0);
            ctx.restore();
        }

        // 2. Main Text Rendering (Readable but Distorted)
        let fontSize = 50; // Declare fontSize as a mutable variable
        ctx.font = `bold ${fontSize}px sans - serif`; // Use template literal
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Split text into lines if it's too long
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        // Measure roughly to wrap
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const w = ctx.measureText(currentLine + " " + word).width;
            if (w < 650) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        // Calculate scaling with spacing
        const letterSpacing = 10; // Explicit spacing to prevent collapse
        let maxLineWidth = 0;

        lines.forEach(line => {
            let currentLineWidth = 0;
            for (const char of line) {
                currentLineWidth += ctx.measureText(char).width + letterSpacing;
            }
            // Remove the last letterSpacing as it's not needed after the last character
            if (line.length > 0) currentLineWidth -= letterSpacing;

            if (currentLineWidth > maxLineWidth) maxLineWidth = currentLineWidth;
        });

        if (maxLineWidth > width - 80) {
            const scale = (width - 80) / maxLineWidth;
            fontSize = Math.floor(fontSize * scale);
            ctx.font = `bold ${fontSize}px sans - serif`; // Update font for rendering
        }

        // Rendering loop with potentially new font size
        const lineHeight = fontSize * 1.4; // Dynamic line height
        const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, lineIdx) => {
            // Recalculate line width for centering with the new font size
            let currentLineWidth = 0;
            for (const char of line) {
                currentLineWidth += ctx.measureText(char).width + letterSpacing;
            }
            if (line.length > 0) currentLineWidth -= letterSpacing; // Remove last spacing

            let currentX = (width - currentLineWidth) / 2;
            const lineY = startY + (lineIdx * lineHeight);

            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                const char = line[charIdx];
                const charWidth = ctx.measureText(char).width;

                ctx.save();

                // Minimal Jitter (Only Y axis significant, X axis almost zero)
                const offsetX = (Math.random() - 0.5) * 2;
                const offsetY = (Math.random() - 0.5) * 6;

                ctx.translate(currentX + charWidth / 2 + offsetX, lineY + offsetY);

                // Very Gentle Scaling
                const scaleX = 0.95 + Math.random() * 0.1;
                const scaleY = 0.95 + Math.random() * 0.1;
                ctx.scale(scaleX, scaleY);

                // Minimal Rotation
                const angle = (Math.random() - 0.5) * 0.2;
                ctx.rotate(angle);

                // Max Contrast
                ctx.shadowColor = 'rgba(0, 0, 0, 1)'; // Heavy shadow
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillStyle = '#ffffff'; // Pure white

                // Draw the character
                ctx.fillText(char, 0, 0);

                ctx.restore();

                // Advance X with full spacing
                currentX += charWidth + letterSpacing;
            }
        });

        // 3. Obstructions (Thinner, cleaner)

        // "Cuts" in background color
        ctx.lineWidth = 2; // Thinner
        ctx.strokeStyle = '#2b2d31';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            // Short cuts or long cuts
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Interference lines (White/Grey)
        ctx.lineWidth = 1; // Very thin
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            // Curved lines
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
                    // Draw icon at rightmost available spot
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
            // Fallback: Just text
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(guildName, width - 20, 30);
        }

        return new AttachmentBuilder(canvas.toBuffer(), { name: 'reverse_challenge.png' });
    }
}
