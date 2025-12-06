import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildConfig extends Document {
    guildId: string;
    gameRoleId?: string;
}

const GuildConfigSchema: Schema = new Schema({
    guildId: { type: String, required: true, unique: true },
    gameRoleId: { type: String, required: false }
});

export const GuildConfig = mongoose.model<IGuildConfig>('GuildConfig', GuildConfigSchema);
