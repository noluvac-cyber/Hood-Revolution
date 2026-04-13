const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give a user a role')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to give')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        // Permission checks
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'That role is higher than my highest role. I cannot assign it.', ephemeral: true });
        }

        // Apply role
        try {
            await targetUser.roles.add(role);
            interaction.reply(`✅ Gave **${role.name}** to **${targetUser.user.tag}**`);
        } catch (err) {
            console.error(err);
            interaction.reply({ content: 'There was an error giving that role.', ephemeral: true });
        }
    }
};
