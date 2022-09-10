const Discord = require("discord.js");
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });

const commands = [
    {
        name: "submitscript",
        description: "Submit scripts to be approved by our staff team. (Spamming/abusing will result in an instant ban)",
        options: [
            {
                name: "script",
                description: "The script you want us to approve goes here",
                required: true,
                type: 3
            },
            {
                name: "description",
                description: "Describe what your script does here.",
                required: true,
                type: 3
            },
            {
                name: "game",
                description: "If your script is for a specific game, paste the link to it here.",
                required: false,
                type: 3
            }
        ]
    }
]

const rest = new Discord.REST({ version: "10" }).setToken(process.env['token']);

(async () => {
    try {
        console.log("refreshing application commands");
        await rest.put(Discord.Routes.applicationCommands("1017486741302689793"), { body: commands });
        console.log("finished refreshing application commands");
    } catch (error) {
        console.error(error);
    }
})();

client.on("ready", () => {
    console.log(`logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "submitscript") {
            await interaction.deferReply({ ephemeral: true });
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const script = interaction.options.getString("script");
            const description = interaction.options.getString("description");
            const game = interaction.options.getString("game") || "Not specified";
    
            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId("approve")
                        .setLabel("Approve")
                        .setEmoji("✅")
                        .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                        .setCustomId("decline")
                        .setLabel("Decline")
                        .setEmoji("❌")
                        .setStyle(Discord.ButtonStyle.Danger)
                );
            
            await client.channels.cache.get("1017499757968621568").send({ content: `Script submitted by <@${interaction.member.id}>\`\`\`lua\n${script}\`\`\`\`\`Description: ${description}\`\`\n\`\`Game: ${game}\`\``, components: [row] });
    
            await interaction.editReply({ content: "Your script has been sent for approval, wait for us to review and test it." });
        }
    } else if (interaction.isButton()) {
        if (interaction.component.label === "Approve") {
            await interaction.deferReply({ ephemeral: true });
            await interaction.message.edit({ components: [] });
            var msg = await client.channels.cache.get("1016393790493298818").send({ content: interaction.message.content });
            msg.react("👍");
            msg.react("👎");
            
            await interaction.editReply({ content: "Sent script to <#1016393790493298818> succesfully." });
        } else if (interaction.component.label === "Decline") {
            await interaction.message.edit({ components: [] });
            interaction.reply({ content: "Declined script successfully.", ephemeral: true });
        }
    }
});

client.login(process.env.token);