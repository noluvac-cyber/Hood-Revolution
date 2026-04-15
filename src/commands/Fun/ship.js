import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed, infoEmbed, warningEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError, TitanBotError, ErrorTypes } from '../../utils/errorHandler.js';
import { sanitizeInput } from '../../utils/sanitization.js';

import { InteractionHelper } from '../../utils/interactionHelper.js';

function stringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export default {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Calculate the compatibility score between two people.")
    .addStringOption((option) =>
      option
        .setName("name1")
        .setDescription("The first name or user.")
        .setRequired(true)
        .setMaxLength(100),
    )
    .addStringOption((option) =>
      option
        .setName("name2")
        .setDescription("The second name or user.")
        .setRequired(true)
        .setMaxLength(100),
    ),
  category: 'Fun',

  async execute(interaction, config, client) {
    try {
      await InteractionHelper.safeDefer(interaction);

      // 🔒 ROLE CHECK — Only users with this role can use the command
      const allowedRoleId = "1435011996931067966";
      if (!interaction.member.roles.cache.has(allowedRoleId)) {
        const embed = errorEmbed(
          "Permission Denied",
          "You do not have permission to use this command."
        );
        return await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
      }

      const name1Raw = interaction.options.getString("name1");
      const name2Raw = interaction.options.getString("name2");

      if (!name1Raw || !name2Raw || name1Raw.trim().length === 0 || name2Raw.trim().length === 0) {
        throw new TitanBotError(
          'Empty names provided to ship command',
          ErrorTypes.USER_INPUT,
          'Please provide valid names for both people!'
        );
      }

      const name1 = sanitizeInput(name1Raw.trim(), 100);
      const name2 = sanitizeInput(name2Raw.trim(), 100);

      if (name1.toLowerCase() === name2.toLowerCase()) {
        const embed = warningEmbed(
          "💖 Ship Score",
          `**${name1}** can't be shipped with themselves! Please choose two different people.`
        );
        return await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
      }

      const sortedNames = [name1, name2].sort();
      const combination = sortedNames.join("-").toLowerCase
