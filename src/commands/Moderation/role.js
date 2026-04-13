const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add or remove roles from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        // /role add
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a role to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to give the role to')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to give')
                        .setRequired(true))
        )

        // /role remove
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a role from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove the role from')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        // Bot permission check
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
        }

        // Role hierarchy check
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'That role is higher than my highest role. I cannot modify it.', ephemeral: true });
        }

        try {
            if (sub === 'add') {
                await targetUser.roles.add(role);
                return interaction.reply(`✅ Added **${role.name}** to **${targetUser.user.tag}**`);
            }

            if (sub === 'remove') {
                await targetUser.roles.remove(role);
                return interaction.reply(`❌ Removed **${role.name}** from **${targetUser.user.tag}**`);
            }
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'There was an error modifying that role.', ephemeral: true });
        }
    }
};

