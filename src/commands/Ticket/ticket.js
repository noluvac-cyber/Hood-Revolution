import { getColor } from '../../config/bot.js';
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { createEmbed, errorEmbed, successEmbed } from '../../utils/embeds.js';
import { getGuildConfig } from '../../services/guildConfig.js';
import { logEvent } from '../../utils/moderation.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';

import ticketLimitsSet from './modules/ticket_limits_set.js';
import ticketLimitsCheck from './modules/ticket_limits_check.js';
import ticketLimitsToggleDM from './modules/ticket_limits_toggle_dm.js';

export default {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Manages the server's ticket system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("setup")
                .setDescription("Sets up the ticket creation panel in a specified channel.")
                .addChannelOption((option) =>
                    option
                        .setName("panel_channel")
                        .setDescription("The channel where the ticket panel will be sent.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("panel_message")
                        .setDescription("The main message/description for the ticket panel.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("button_label")
                        .setDescription("The label for the ticket creation button (default: Create Ticket)")
                        .setRequired(false),
                )
                .addChannelOption((option) =>
                    option
                        .setName("category")
                        .setDescription("The category where new tickets will be created (optional).")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(false),
                )
                .addChannelOption((option) =>
                    option
                        .setName("closed_category")
                        .setDescription("The category where closed tickets will be moved (optional).")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(false),
                )
                .addRoleOption((option) =>
                    option
                        .setName("staff_role")
                        .setDescription("The role that can access tickets.")
                        .setRequired(false),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("max_tickets_per_user")
                        .setDescription("Maximum number of tickets a user can create (default: 3)")
                        .setMinValue(1)
                        .setMaxValue(10)
                        .setRequired(false),
                )
                .addBooleanOption((option) =>
                    option
                        .setName("dm_on_close")
                        .setDescription("Send DM to user when their ticket is closed (default: true)")
                        .setRequired(false),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName("limits")
                .setDescription("Manage ticket limits and settings")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("set")
                        .setDescription("Set the maximum number of tickets per user")
                        .addIntegerOption((option) =>
                            option
                                .setName("max_tickets")
                                .setDescription("Maximum number of tickets a user can create (1-10)")
                                .setMinValue(1)
                                .setMaxValue(10)
                                .setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("check")
                        .setDescription("Check a user's current ticket count")
                        .addUserOption((option) =>
                            option
                                .setName("user")
                                .setDescription("The user to check")
                                .setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("toggle_dm")
                        .setDescription("Toggle DM notifications when tickets are closed")
                )
        ),
    category: "ticket",

    async execute(interaction, config, client) {
        try {
            const deferred = await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });
            if (!deferred) return;

            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return await Interaction
