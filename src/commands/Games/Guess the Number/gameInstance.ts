import { GuessTheNumberManager } from './manager';
import { Client } from 'discord.js';

export const getGuessTheNumberManager = (client: Client): GuessTheNumberManager => {
    return GuessTheNumberManager.getInstance(client);
};


