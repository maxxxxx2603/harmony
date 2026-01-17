const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// IDs des channels pour Harmony
const ANNOUNCE_CHANNEL_ID = '1273007405948735685';
const CV_REVIEW_CHANNEL_ID = '1461484567587455222';
const DISPO_CHANNEL_ID = '1457839783274614805';
// Pas de ROLE_ID nécessaire pour Harmony
// Système de vente de kits / paie
const SALES_CHANNEL_ID = '1461485195877421118';
const SALARY_AWARD_PER_BATCH = 100000; // +100.000 $ par palier de 20 kits
const DATA_DIR = path.join(__dirname, '..', 'data');
const PAYROLL_FILE = path.join(DATA_DIR, 'payroll.json');
const CUSTOMS_FILE = path.join(DATA_DIR, 'customs.json');
const CUSTOMS_CHANNEL_ID = 'all'; // Tous les channels pour customisations
// Annonce recrutement via /rc
const RECRUIT_ANNOUNCE_CHANNEL_ID = '1461484567587455222';
const GUILD_ID = '1273007405046693888';
// Rôles
const CITIZEN_ROLE_ID = '1273007405046693889';
// Pas de STAFF_ROLE_ID nécessaire pour Harmony
const ID_CARD_CHANNEL_ID = '1453169059825717442';
const DIRECTION_ROLE_ID = '1461486337898053665';
const COMMANDE_CATEGORY_ID = '1461485731565277347';
const CONTRAT_CATEGORY_ID = '1389902369063702600';
const TICKET_ANNOUNCE_CHANNEL_ID = '1377365506700345466'; // Channel pour l'annonce des tickets

// Stockage temporaire des CVs en cours
const activeApplications = new Map();
const completedApplications = new Map(); // Stocker les CVs complets pour récupération lors de l'acceptation
const activeTickets = new Map();
const activeCustoms = new Map(); // Stocker les customisations en cours

// Questions du CV
const questions = [
    "Nom & Prénom :",
    "Âge :",
    "Numéro de téléphone :",
    "Ancienneté en ville :",
    "Métiers précédents :",
    "Compétences particulières :",
    "Motivations pour rejoindre Harmony :",
    "Disponibilités :",
    "🪪 Pièce d'identité :"
];

client.once('ready', async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    // Auto-annonces désactivées pour éviter les doublons à chaque démarrage
    // sendAnnouncement();
    // sendTicketAnnouncement();
    await registerCommands();
    
    // Sauvegarde automatique toutes les 10 minutes
    setInterval(() => {
        try {
            const payroll = loadPayroll();
            const customs = loadCustoms();
            
            // Mettre à jour la date de dernière sauvegarde
            payroll.lastUpdated = new Date().toISOString();
            
            // Sauvegarder les fichiers
            fs.writeFileSync(PAYROLL_FILE, JSON.stringify(payroll, null, 2));
            fs.writeFileSync(CUSTOMS_FILE, JSON.stringify(customs, null, 2));
            
            console.log(`✅ [${new Date().toLocaleString('fr-FR')}] Sauvegarde automatique effectuée`);
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde automatique:', error);
        }
    }, 10 * 60 * 1000); // 10 minutes en millisecondes
});

// Envoyer l'annonce de recrutement
async function sendAnnouncement() {
    try {
        const channel = await client.channels.fetch(ANNOUNCE_CHANNEL_ID);
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Recrutement Harmony Custom')
            .setDescription('**Harmony Custom recrute !**\n\nNous recherchons des personnes motivées pour rejoindre notre équipe.\n\nCliquez sur le bouton ci-dessous pour postuler et remplir votre candidature.')
            .setColor('#00FF00')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_application')
                    .setLabel('📝 Postuler')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({ embeds: [embed], components: [row] });
        console.log('✅ Annonce de recrutement envoyée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'annonce:', error);
    }
}

// Envoyer l'annonce des tickets
async function sendTicketAnnouncement() {
    try {
        const channel = await client.channels.fetch(TICKET_ANNOUNCE_CHANNEL_ID);
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 Système de Tickets')
            .setDescription('**Besoin d\'aide ?**\n\nChoisissez le type de ticket que vous souhaitez créer :\n\n📦 **Commande** - Pour toute demande liée aux commandes\n📋 **Contrat** - Pour toute demande de contrat')
            .setColor('#5865F2')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_commande')
                    .setLabel('📦 Commande')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_contrat')
                    .setLabel('📋 Contrat')
                    .setStyle(ButtonStyle.Success)
            );

        await channel.send({ embeds: [embed], components: [row] });
        console.log('✅ Annonce des tickets envoyée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'annonce des tickets:', error);
    }
}

// Enregistrer les commandes slash (/rc et /kit)
async function registerCommands() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.commands.set([
            {
                name: 'rc',
                description: "Publier l'annonce de recrutement"
            },
            {
                name: 'kit',
                description: 'Déclarer une vente de kits avec facture',
                options: [
                    {
                        name: 'nombre',
                        description: 'Nombre de kits vendus',
                        type: 4, // Integer
                        required: true
                    },
                    {
                        name: 'facture',
                        description: "Capture d'écran de la facture",
                        type: 11, // Attachment
                        required: true
                    }
                ]
            },
            {
                name: 'total-kit',
                description: 'Afficher les statistiques de vente de kits de tous les employés'
            },
            {
                name: 'add',
                description: 'Ajouter un employé (attribuer rôles et créer channel)',
                options: [
                    {
                        name: 'employe',
                        description: 'L\'employé à ajouter',
                        type: 6, // User
                        required: true
                    }
                ]
            },
            {
                name: 'up',
                description: 'Monter un employé de grade (ER → E → EE)',
                options: [
                    {
                        name: 'employe',
                        description: 'L\'employé à promouvoir',
                        type: 6, // User
                        required: true
                    }
                ]
            },
            {
                name: 'virer',
                description: 'Virer un employé (supprimer channel et rôles)',
                options: [
                    {
                        name: 'employe',
                        description: 'L\'employé à virer',
                        type: 6, // User
                        required: true
                    }
                ]
            },
            {
                name: 'custom',
                description: 'Déclarer une customisation (véhicule, import, GTA Online)'
            },
            {
                name: 'facture',
                description: 'Voir toutes les factures de customisation'
            },
            {
                name: 'reset',
                description: 'Réinitialiser toutes les données (kits, customs, factures)'
            },
            {
                name: 'payes',
                description: 'Voir les payes de tous les employés (factures + primes kits)'
            },
            {
                name: 'remuneration',
                description: 'Publier l\'annonce de rémunération et règlement pour les employés'
            },
            {
                name: 'info',
                description: 'Afficher toutes les informations et commandes du bot'
            },
            {
                name: 'reglement',
                description: 'Publier le règlement interne de Harmony Custom'
            },
            {
                name: 'setdata',
                description: 'Initialiser les données de Jayden Jonson (admin only)'
            }
        ]);
        console.log('✅ Commandes /rc, /kit, /total-kit, /add, /up, /virer, /custom, /facture, /reset, /payes, /remuneration, /info, /reglement et /setdata enregistrées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
}

// Helpers persistance paie
function ensureDataDir() {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function loadPayroll() {
    ensureDataDir();
    try {
        const raw = fs.readFileSync(PAYROLL_FILE, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { users: {} };
    }
}

function savePayroll(data) {
    ensureDataDir();
    fs.writeFileSync(PAYROLL_FILE, JSON.stringify(data, null, 2), 'utf8');
}
// Helpers customs
function loadCustoms() {
    ensureDataDir();
    try {
        const raw = fs.readFileSync(CUSTOMS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { customs: [], quotas: {} };
    }
}

function saveCustoms(data) {
    ensureDataDir();
    fs.writeFileSync(CUSTOMS_FILE, JSON.stringify(data, null, 2));
}
// Gérer les interactions
client.on('interactionCreate', async interaction => {
    // Slash command /rc
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'rc') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                // Charger les rôles pour la recherche par nom
                await interaction.guild.roles.fetch();

                // Trouver le rôle citoyen
                let citizenRoleId = CITIZEN_ROLE_ID;
                if (!citizenRoleId) {
                    const citizenRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('citoyen'));
                    if (citizenRole) citizenRoleId = citizenRole.id;
                }

                const channel = await client.channels.fetch(RECRUIT_ANNOUNCE_CHANNEL_ID);

                const embed = new EmbedBuilder()
                    .setTitle('📋 Recrutement Harmony Custom')
                    .setDescription('**Harmony Custom recrute !**\n\nNous recherchons des personnes motivées pour rejoindre notre équipe.\n\n📝 **Les CV se font ici:** <#1210594716802883604>\n\nCliquez sur le bouton dans l\'annonce principale pour postuler et remplir votre candidature.')
                    .setColor('#00FF00')
                    .setTimestamp();

                const content = citizenRoleId ? `<@&${citizenRoleId}>` : '';
                await channel.send({ content, embeds: [embed] });

                await interaction.editReply({ content: '✅ Annonce de recrutement envoyée.' });
                console.log('✅ Annonce /rc envoyée');
            } catch (error) {
                console.error('❌ Erreur lors de l\'exécution de /rc:', error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors de l\'envoi de l\'annonce.' });
                } else {
                    await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'envoi de l\'annonce.', ephemeral: true });
                }
            }
        }
        // Slash command /kit
        if (interaction.commandName === 'kit') {
            try {
                // Vérifier que la commande est utilisée dans la catégorie employés
                const EMPLOYEE_CATEGORY_ID = '1424376634554716322';
                if (interaction.channel.parentId !== EMPLOYEE_CATEGORY_ID) {
                    return interaction.reply({ content: '❌ Cette commande ne peut être utilisée que dans votre channel privé d\'employé.', ephemeral: true });
                }

                const nombre = interaction.options.getInteger('nombre');
                const facture = interaction.options.getAttachment('facture');

                if (!nombre || nombre <= 0) {
                    return interaction.reply({ content: '❌ Le nombre de kits doit être un entier positif.', ephemeral: true });
                }
                if (!facture) {
                    return interaction.reply({ content: "❌ Vous devez joindre la capture d'écran de la facture.", ephemeral: true });
                }

                // Mise à jour paie
                const payroll = loadPayroll();
                const userId = interaction.user.id;
                const now = Date.now();

                const prev = payroll.users[userId]?.kits || 0;
                const newTotal = prev + nombre;
                const prevBatches = Math.floor(prev / 20);
                const newBatches = Math.floor(newTotal / 20);
                const awardedBatches = newBatches - prevBatches;
                const awardAmount = awardedBatches > 0 ? awardedBatches * SALARY_AWARD_PER_BATCH : 0;

                payroll.users[userId] = payroll.users[userId] || { kits: 0, history: [] };
                payroll.users[userId].kits = newTotal;
                payroll.users[userId].history.push({
                    timestamp: now,
                    kits: nombre,
                    invoiceUrl: facture.url
                });
                savePayroll(payroll);

                const fmt = new Intl.NumberFormat('fr-FR');

                const embed = new EmbedBuilder()
                    .setTitle('🧰 Vente de kits enregistrée')
                    .setDescription(`Déclaration par ${interaction.user}`)
                    .addFields(
                        { name: 'Kits ajoutés', value: `${nombre}`, inline: true },
                        { name: 'Total kits', value: `${newTotal}`, inline: true },
                        { name: 'Facture', value: `[Voir la capture](${facture.url})`, inline: false }
                    )
                    .setColor('#2ECC71')
                    .setTimestamp();

                const awardMsg = awardAmount > 0 ? `🎉 Bonus salaire : +${fmt.format(awardAmount)} $ (palier atteint)` : undefined;

                await interaction.reply({ content: awardMsg, embeds: [embed] });
                console.log(`✅ Vente enregistrée: ${interaction.user.tag} +${nombre} (total ${newTotal})`);
            } catch (error) {
                console.error('❌ Erreur /kit:', error);
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /total-kit
        if (interaction.commandName === 'total-kit') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const payroll = loadPayroll();
                const users = payroll.users || {};
                const fmt = new Intl.NumberFormat('fr-FR');

                if (Object.keys(users).length === 0) {
                    return interaction.editReply({ content: '❌ Aucune vente de kit enregistrée pour le moment.' });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📊 Statistiques de Vente de Kits')
                    .setDescription('Résumé des ventes par employé')
                    .setColor('#3498DB')
                    .setTimestamp();

                for (const [userId, data] of Object.entries(users)) {
                    const totalKits = data.kits || 0;
                    const batches = Math.floor(totalKits / 20);
                    const bonusSalary = batches * SALARY_AWARD_PER_BATCH;

                    try {
                        const user = await client.users.fetch(userId);
                        const member = await interaction.guild.members.fetch(userId);
                        embed.addFields({
                            name: `👤 ${member.displayName}`,
                            value: `📦 Kits vendus: **${totalKits}**\n💰 Bonus salaire: **+${fmt.format(bonusSalary)} $**`,
                            inline: true
                        });
                    } catch (err) {
                        embed.addFields({
                            name: `👤 Utilisateur ${userId}`,
                            value: `📦 Kits vendus: **${totalKits}**\n💰 Bonus salaire: **+${fmt.format(bonusSalary)} $**`,
                            inline: true
                        });
                    }
                }

                await interaction.editReply({ embeds: [embed] });
                console.log('✅ Commande /total-kit exécutée');
            } catch (error) {
                console.error('❌ Erreur /total-kit:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors de la récupération des statistiques.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /add
        if (interaction.commandName === 'add') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const targetUser = interaction.options.getUser('employe');
                const targetMember = await interaction.guild.members.fetch(targetUser.id);

                // Ajouter les rôles employé
                const role1 = await interaction.guild.roles.fetch('1288186552249225380');
                const role2 = await interaction.guild.roles.fetch('1363091238923931658');
                const roleToRemove = await interaction.guild.roles.fetch('1458961638316179648');

                if (role1) await targetMember.roles.add(role1);
                if (role2) await targetMember.roles.add(role2);
                if (roleToRemove) await targetMember.roles.remove(roleToRemove);

                // Renommer l'employé avec le préfixe [ER]
                let newNickname = `[ER] ${targetMember.displayName}`;
                try {
                    await targetMember.setNickname(newNickname);
                } catch (nickError) {
                    console.warn(`⚠️ Impossible de renommer ${targetUser.tag}: ${nickError.message}`);
                    newNickname = `${targetMember.displayName} (⚠️ renommage impossible)`;
                }

                // Créer un channel avec le nom de l'employé dans la catégorie spécifiée
                const baseName = targetMember.displayName.toLowerCase().replace(/\[\w+\]\s*/, '').replace(/\s+/g, '-');
                const channelName = `🔴-er-${baseName}`;
                const employeeChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: '1424376634554716322',
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: targetUser.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                        // Les admins peuvent voir tous les channels par défaut grâce à leur permission Administrator
                    ]
                });

                // Envoyer l'annonce d'explication dans le channel de l'employé
                const welcomeEmbed = new EmbedBuilder()
                    .setTitle('👋 Bienvenue chez Harmony\'s !')
                    .setDescription(`Félicitations ${targetUser}, vous êtes maintenant employé chez Harmony's !\n\nVoici les commandes à votre disposition :`)
                    .addFields(
                        {
                            name: '🛠️ /custom - Enregistrer une customisation',
                            value: '**Comment l\'utiliser :**\n1️⃣ Tapez `/custom` dans ce channel\n2️⃣ Sélectionnez le type (🛍️ Boutique, 📦 Import, 🎮 GTA Online)\n3️⃣ Entrez le montant de la facture\n4️⃣ Envoyez **1 capture d\'écran** contenant la facture ET la carte d\'identité du client\n\n✅ La customisation sera automatiquement enregistrée !',
                            inline: false
                        },
                        {
                            name: '📦 /kit - Déclarer une vente de kit de réparation',
                            value: '**Comment l\'utiliser :**\n1️⃣ Tapez `/kit` dans ce channel\n2️⃣ Indiquez le **nombre de kits vendus** (ex: 1, 2, 5...)\n3️⃣ Joignez une **capture d\'écran de la facture**\n\n✅ La vente sera automatiquement enregistrée !\n\n💰 **Système de prime :** Tous les 20 kits vendus = **+100 000$** sur votre salaire !',
                            inline: false
                        }
                    )
                    .setColor('#3498DB')
                    .setFooter({ text: 'Bonne chance et bon travail !' })
                    .setTimestamp();

                await employeeChannel.send({ embeds: [welcomeEmbed] });

                const embed = new EmbedBuilder()
                    .setTitle('✅ Employé ajouté')
                    .setDescription(`${targetUser} a été ajouté en tant qu'employé.`)
                    .addFields(
                        { name: 'Rôles ajoutés', value: '✅ Rôles employé attribués', inline: true },
                        { name: 'Pseudo', value: `${newNickname}`, inline: true },
                        { name: 'Channel créé', value: `<#${employeeChannel.id}>`, inline: true }
                    )
                    .setColor('#2ECC71')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                console.log(`✅ Employé ajouté: ${targetUser.tag}`);
            } catch (error) {
                console.error('❌ Erreur /add:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors de l\'ajout de l\'employé.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /up
        if (interaction.commandName === 'up') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const targetUser = interaction.options.getUser('employe');
                const targetMember = await interaction.guild.members.fetch(targetUser.id);

                // Vérifier si l'employé a déjà le rôle E (1351702387198394429)
                const hasRoleE = targetMember.roles.cache.has('1351702387198394429');

                let newNickname, newChannelName, gradeText;

                if (hasRoleE) {
                    // Promotion E → EE
                    const roleToRemove = await interaction.guild.roles.fetch('1351702387198394429');
                    const roleToAdd = await interaction.guild.roles.fetch('1288186576513269843');
                    
                    if (roleToRemove) await targetMember.roles.remove(roleToRemove);
                    if (roleToAdd) await targetMember.roles.add(roleToAdd);

                    // Renommer de [E] à [EE]
                    newNickname = targetMember.displayName.replace('[E]', '[EE]');
                    if (!targetMember.displayName.includes('[E]')) {
                        newNickname = `[EE] ${targetMember.displayName.replace(/^\[\w+\]\s*/, '')}`;
                    }
                    
                    gradeText = 'EE';
                    newChannelName = '-ee-';
                } else {
                    // Promotion ER → E
                    const roleToRemove = await interaction.guild.roles.fetch('1288186552249225380');
                    const roleToAdd = await interaction.guild.roles.fetch('1351702387198394429');
                    
                    if (roleToRemove) await targetMember.roles.remove(roleToRemove);
                    if (roleToAdd) await targetMember.roles.add(roleToAdd);

                    // Renommer de [ER] à [E]
                    newNickname = targetMember.displayName.replace('[ER]', '[E]');
                    if (!targetMember.displayName.includes('[ER]')) {
                        newNickname = `[E] ${targetMember.displayName.replace(/^\[\w+\]\s*/, '')}`;
                    }
                    
                    gradeText = 'E';
                    newChannelName = '-e-';
                }
                
                try {
                    await targetMember.setNickname(newNickname);
                } catch (nickError) {
                    console.warn(`⚠️ Impossible de renommer ${targetUser.tag}: ${nickError.message}`);
                }

                // Trouver le channel de l'employé (commence par 🔴 et contient le nom)
                const baseUsername = targetMember.displayName.toLowerCase().replace(/\[\w+\]\s*/, '').replace(/\s+/g, '-');
                const channels = interaction.guild.channels.cache.filter(c => 
                    c.type === ChannelType.GuildText && 
                    c.name.includes(baseUsername)
                );

                let employeeChannel = null;
                for (const [id, channel] of channels) {
                    if (channel.name.startsWith('🔴')) {
                        employeeChannel = channel;
                        break;
                    }
                }

                if (employeeChannel) {
                    // Renommer le channel selon la promotion
                    let updatedChannelName;
                    if (hasRoleE) {
                        // E → EE
                        updatedChannelName = employeeChannel.name.replace('-e-', '-ee-').replace('🔴-e-', '🔴-ee-');
                    } else {
                        // ER → E
                        updatedChannelName = employeeChannel.name.replace('-er-', '-e-').replace('🔴-er-', '🔴-e-');
                    }
                    await employeeChannel.setName(updatedChannelName);
                    
                    // Déplacer le channel en haut (position 0 dans la catégorie)
                    await employeeChannel.setPosition(0);
                }

                const embed = new EmbedBuilder()
                    .setTitle('⬆️ Promotion')
                    .setDescription(`${targetUser} a été promu au grade ${gradeText} !`)
                    .addFields(
                        { name: 'Nouveau pseudo', value: newNickname, inline: true },
                        { name: 'Channel', value: employeeChannel ? `<#${employeeChannel.id}>` : '⚠️ Channel non trouvé', inline: true }
                    )
                    .setColor('#9B59B6')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                console.log(`✅ Promotion: ${targetUser.tag} → Grade E`);
            } catch (error) {
                console.error('❌ Erreur /up:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors de la promotion.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /virer
        if (interaction.commandName === 'virer') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const targetUser = interaction.options.getUser('employe');
                const targetMember = await interaction.guild.members.fetch(targetUser.id);

                // Trouver le channel de l'employé
                const baseUsername = targetMember.displayName.toLowerCase().replace(/\[\w+\]\s*/, '').replace(/\s+/g, '-');
                const channels = interaction.guild.channels.cache.filter(c => 
                    c.type === ChannelType.GuildText && 
                    c.name.includes(baseUsername) &&
                    c.name.startsWith('🔴')
                );

                let employeeChannel = null;
                for (const [id, channel] of channels) {
                    employeeChannel = channel;
                    break;
                }

                // Supprimer le channel
                if (employeeChannel) {
                    await employeeChannel.delete();
                }

                // Retirer tous les rôles sauf le rôle spécifique
                const keepRoleId = '1210594673618460733';
                const keepRole = await interaction.guild.roles.fetch(keepRoleId);
                
                // Récupérer tous les rôles du membre
                const rolesToRemove = targetMember.roles.cache.filter(role => 
                    role.id !== keepRoleId && 
                    role.id !== interaction.guild.id // Ne pas retirer @everyone
                );

                // Retirer tous les rôles
                for (const [roleId, role] of rolesToRemove) {
                    try {
                        await targetMember.roles.remove(role);
                    } catch (err) {
                        console.warn(`⚠️ Impossible de retirer le rôle ${role.name}: ${err.message}`);
                    }
                }

                // S'assurer que le membre a le rôle à garder
                if (keepRole && !targetMember.roles.cache.has(keepRoleId)) {
                    await targetMember.roles.add(keepRole);
                }

                // Retirer le préfixe [ER], [E], [EE] du pseudo
                try {
                    const currentNickname = targetMember.displayName;
                    const newNickname = currentNickname.replace(/^\[(ER|E|EE)\]\s*/, '');
                    if (newNickname !== currentNickname) {
                        await targetMember.setNickname(newNickname);
                    }
                } catch (nickError) {
                    console.warn(`⚠️ Impossible de renommer ${targetUser.tag}: ${nickError.message}`);
                }

                const embed = new EmbedBuilder()
                    .setTitle('🚪 Employé viré')
                    .setDescription(`${targetUser} a été viré.`)
                    .addFields(
                        { name: 'Channel', value: employeeChannel ? '✅ Supprimé' : '⚠️ Non trouvé', inline: true },
                        { name: 'Rôles', value: `${rolesToRemove.size} rôle(s) retiré(s)`, inline: true }
                    )
                    .setColor('#E74C3C')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                console.log(`✅ Employé viré: ${targetUser.tag}`);
            } catch (error) {
                console.error('❌ Erreur /virer:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue lors du licenciement.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /custom
        if (interaction.commandName === 'custom') {
            try {
                // Vérifier que la commande est utilisée dans la catégorie employés
                const EMPLOYEE_CATEGORY_ID = '1424376634554716322';
                if (interaction.channel.parentId !== EMPLOYEE_CATEGORY_ID) {
                    return interaction.reply({ content: '❌ Cette commande ne peut être utilisée que dans votre channel privé d\'employé.', ephemeral: true });
                }

                // Créer le menu déroulant pour le type de custom
                const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
                
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('custom_type_select')
                    .setPlaceholder('Choisissez le type de customisation')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('�️ Boutique')
                            .setValue('boutique')
                            .setEmoji('🛍️'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('📦 Import')
                            .setValue('import')
                            .setEmoji('📦'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('🎮 GTA Online')
                            .setValue('gta_online')
                            .setEmoji('🎮')
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);
                
                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel_custom')
                    .setLabel('❌ Annuler')
                    .setStyle(ButtonStyle.Danger);
                
                const buttonRow = new ActionRowBuilder().addComponents(cancelButton);

                await interaction.reply({
                    content: '🛠️ **Nouvelle customisation**\n\nSélectionnez le type de customisation :',
                    components: [row, buttonRow],
                    ephemeral: false
                });

                // Initialiser la customisation
                activeCustoms.set(interaction.user.id, {
                    step: 'type',
                    channelId: interaction.channelId,
                    messageId: null,
                    messagesToDelete: []
                });
            } catch (error) {
                console.error('❌ Erreur /custom:', error);
                if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /remuneration
        if (interaction.commandName === 'remuneration') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                const REGLEMENT_CHANNEL_ID = '1273007405541884032';
                const reglementChannel = await client.channels.fetch(REGLEMENT_CHANNEL_ID);

                // Embed principal
                const mainEmbed = new EmbedBuilder()
                    .setTitle('💼 Harmony\'s - Rémunération & Règlement')
                    .setDescription('👋 **Bienvenue chez Harmony\'s !**\n\nVoici toutes les informations importantes concernant votre rémunération et les règles à respecter.')
                    .setColor('#F39C12')
                    .setTimestamp();

                // Embed rémunération
                const payEmbed = new EmbedBuilder()
                    .setTitle('💰 Système de Rémunération')
                    .setDescription('Votre salaire est calculé en fonction de vos performances et de votre grade :')
                    .addFields(
                        {
                            name: '🎯 Quota de Customisations',
                            value: '• **Le quota est de 40 customisations**\n• **Minimum requis :** 20 customisations pour être payé\n• **⚠️ Important :** Moins de 20 customs = **Aucune rémunération**\n• **Indicateur :** 🔴 (en cours) / 🟢 (quota atteint)',
                            inline: false
                        },
                        {
                            name: '� Multiplicateurs par Type de Véhicule',
                            value: '**🔹 x2 – Véhicules Boutique**\n• Plaques : **4 chiffres / 4 lettres** (Ex: 1234 ABCD)\n\n**🔹 x2.5 – Import**\n• Plaques : **2 chiffres / 3 lettres** (Ex: 42 HBC)\n• **Prix usine élevé** (équivalent boutique)\n\n**🔹 x10 – Concessionnaire Standard**\n• Plaques : **2 chiffres / 3 lettres** (Ex: 12 ABC)\n• **Prix usine faible** (moteur 4 < 100 000$)\n\n⚠️ **Vérifiez toujours les plaques avant de facturer !**',
                            inline: false
                        },
                        {
                            name: '💵 Pourcentages par Grade',
                            value: '• **[ER]** Employé Recrue : **15%** des factures\n• **[E]** Employé : **20%** des factures\n• **[EE]** Employé Expert : **25%** des factures',
                            inline: false
                        },
                        {
                            name: '📦 Prime Kits de Réparation',
                            value: '• Tous les **20 kits vendus** = **+100 000$** de prime !\n• Les kits se cumulent : 40 kits = 200 000$, 60 kits = 300 000$, etc.',
                            inline: false
                        }
                    )
                    .setColor('#2ECC71');

                // Embed règlement
                const rulesEmbed = new EmbedBuilder()
                    .setTitle('📜 Règlement Intérieur')
                    .addFields(
                        {
                            name: '👔 Tenue Obligatoire',
                            value: '• La **tenue Harmony\'s** est **OBLIGATOIRE** pendant le service\n• Les tenues sont disponibles dans le **coffre de l\'entreprise**\n• Présentez-vous toujours en tenue professionnelle',
                            inline: false
                        },
                        {
                            name: '📝 Déclarations',
                            value: '• **Toutes** les customisations doivent être déclarées via `/custom`\n• **Tous** les kits vendus doivent être déclarés via `/kit`\n• Les captures d\'écran sont obligatoires (facture + ID client)',
                            inline: false
                        },
                        {
                            name: 'ℹ️ Commandes Disponibles',
                            value: '• `/custom` - Déclarer une customisation\n• `/kit` - Déclarer une vente de kit\n• Consultez votre channel privé pour plus d\'infos',
                            inline: false
                        }
                    )
                    .setColor('#E74C3C');

                // Embed footer
                const footerEmbed = new EmbedBuilder()
                    .setDescription('🚀 **Bon travail chez Harmony\'s !**\n\nEn cas de question, contactez la direction.')
                    .setColor('#3498DB');

                await reglementChannel.send({ embeds: [mainEmbed, payEmbed, rulesEmbed, footerEmbed] });
                await interaction.editReply({ content: `✅ Annonce de rémunération et règlement envoyée dans <#${REGLEMENT_CHANNEL_ID}>` });
                console.log('✅ Commande /remuneration exécutée');
            } catch (error) {
                console.error('❌ Erreur /remuneration:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /info
        if (interaction.commandName === 'info') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                const INFO_CHANNEL_ID = '1413842011060047943';
                const infoChannel = await client.channels.fetch(INFO_CHANNEL_ID);

                // Créer l'embed principal
                const mainEmbed = new EmbedBuilder()
                    .setTitle('🤖 Harmony\'s BOT - Guide Complet')
                    .setDescription('Bienvenue sur le bot de gestion de Harmony\'s ! Voici toutes les fonctionnalités disponibles.')
                    .setColor('#3498DB')
                    .setTimestamp();

                // Embed pour les employés
                const employeeEmbed = new EmbedBuilder()
                    .setTitle('👥 Commandes Employés')
                    .setDescription('Commandes disponibles pour tous les employés :')
                    .addFields(
                        {
                            name: '🛠️ /custom - Enregistrer une customisation',
                            value: '**Utilisation :**\n1️⃣ Tapez `/custom`\n2️⃣ Sélectionnez le type (🛍️ Boutique / 📦 Import / 🎮 GTA Online)\n3️⃣ Entrez le montant\n4️⃣ Envoyez 1 capture (facture + ID client)\n\n🎯 **Quota :** Chaque custom = +1 au quota (objectif 40, minimum 20 pour être payé)',
                            inline: false
                        },
                        {
                            name: '📦 /kit - Déclarer une vente de kit',
                            value: '**Utilisation :**\n1️⃣ Tapez `/kit`\n2️⃣ Indiquez le nombre de kits vendus\n3️⃣ Joignez la capture de la facture\n\n💰 **Prime :** 20 kits = +100 000$ sur votre salaire !',
                            inline: false
                        }
                    )
                    .setColor('#2ECC71');

                // Embed pour les admins
                const adminEmbed = new EmbedBuilder()
                    .setTitle('🔑 Commandes Administrateurs')
                    .setDescription('Commandes réservées à la direction :')
                    .addFields(
                        {
                            name: '📝 /rc - Recrutement',
                            value: 'Publie l\'annonce de recrutement avec bouton pour postuler.',
                            inline: true
                        },
                        {
                            name: '➕ /add - Ajouter un employé',
                            value: 'Ajoute un employé : attribution des rôles, création du channel privé, renommage en [ER].',
                            inline: true
                        },
                        {
                            name: '⬆️ /up - Promotion',
                            value: 'Promeut un employé automatiquement : ER → E → EE (rôles + channel).',
                            inline: true
                        },
                        {
                            name: '❌ /virer - Licenciement',
                            value: 'Retire tous les rôles et supprime le channel de l\'employé.',
                            inline: true
                        },
                        {
                            name: '📊 /total-kit - Stats kits',
                            value: 'Affiche le total des kits vendus par employé + primes.',
                            inline: true
                        },
                        {
                            name: '📄 /facture - Stats customs',
                            value: 'Récapitulatif de toutes les factures de customisation par employé.',
                            inline: true
                        },
                        {
                            name: '💰 /payes - Calcul des payes',
                            value: 'Affiche les payes de tous les employés :\n• **[ER]** : 15% factures + primes\n• **[E]** : 20% factures + primes\n• **[EE]** : 25% factures + primes\n\n⚠️ Quota < 20 = 0$ de paye',
                            inline: true
                        },
                        {
                            name: '🔄 /reset - Réinitialisation',
                            value: 'Remet à zéro toutes les données : kits, customs, quotas, payes.',
                            inline: true
                        },
                        {
                            name: 'ℹ️ /info - Aide',
                            value: 'Affiche ce message d\'aide complet.',
                            inline: true
                        }
                    )
                    .setColor('#E74C3C');

                // Embed système
                const systemEmbed = new EmbedBuilder()
                    .setTitle('⚙️ Systèmes Automatiques')
                    .setDescription('Fonctionnalités automatisées du bot :')
                    .addFields(
                        {
                            name: '📝 Système de Candidature (CV)',
                            value: '• 9 questions automatiques\n• Channel privé créé pour chaque candidat\n• CV envoyé pour révision avec boutons Accepter/Refuser\n• Carte d\'identité automatiquement archivée\n• Message de bienvenue avec explications',
                            inline: false
                        },
                        {
                            name: '🎫 Système de Tickets',
                            value: '• **Commande** : Tickets dans catégorie 1332876434259316859\n• **Contrat** : Tickets dans catégorie 1459164385829322949\n• Channel privé avec le client',
                            inline: false
                        },
                        {
                            name: '🎯 Système de Quota',
                            value: '• **Objectif** : 40 customs par employé\n• **Minimum** : 20 customs pour être payé\n• **Indicateur** : 🔴 (quota non atteint) → 🟢 (quota atteint)\n• Channel automatiquement mis à jour',
                            inline: false
                        },
                        {
                            name: '💸 Système de Payes',
                            value: '• **[ER]** : 15% des factures\n• **[E]** : 20% des factures\n• **[EE]** : 25% des factures\n• **Prime kits** : 20 kits = +100 000$\n• Si quota < 20 : Aucune paye',
                            inline: false
                        }
                    )
                    .setColor('#F1C40F');

                await infoChannel.send({ embeds: [mainEmbed, employeeEmbed, adminEmbed, systemEmbed] });
                await interaction.editReply({ content: `✅ Message d'information envoyé dans <#${INFO_CHANNEL_ID}>` });
                console.log('✅ Commande /info exécutée');
            } catch (error) {
                console.error('❌ Erreur /info:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /reglement
        if (interaction.commandName === 'reglement') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                const REGLEMENT_CHANNEL_ID = '1362546408271384698';
                const reglementChannel = await client.channels.fetch(REGLEMENT_CHANNEL_ID);

                // Embed principal
                const mainEmbed = new EmbedBuilder()
                    .setTitle('📋 Règlement Interne – Harmony Custom')
                    .setDescription('Voici les règles officielles que tout employé doit respecter pour maintenir l\'harmonie et le professionnalisme au sein de l\'entreprise.')
                    .setColor('#FFD700')
                    .setTimestamp();

                // Embed présence
                const presenceEmbed = new EmbedBuilder()
                    .setTitle('🕒 Présence & Disponibilité')
                    .addFields(
                        {
                            name: 'Obligation de présence',
                            value: 'Tous les employés doivent être **actifs et présents** pour accomplir leur travail.',
                            inline: false
                        },
                        {
                            name: 'Signalement des absences',
                            value: 'Toute **absence prolongée** doit être **signalée à la direction** dans le salon approprié.',
                            inline: false
                        }
                    )
                    .setColor('#3498DB');

                // Embed réunions
                const reunionsEmbed = new EmbedBuilder()
                    .setTitle('💼 Réunions Obligatoires')
                    .setDescription('• Les **réunions d\'entreprise** sont **obligatoires** pour tous les employés.\n• Toute **absence non justifiée** entraînera des **sanctions**.')
                    .setColor('#9B59B6');

                // Embed travail
                const travailEmbed = new EmbedBuilder()
                    .setTitle('🎯 Travail & Performance')
                    .addFields(
                        {
                            name: 'Quota de customisations',
                            value: '• **Objectif :** 40 customs par période\n• **Minimum requis :** 20 customs pour être payé\n• ⚠️ **Moins de 20 customs = Aucune rémunération**',
                            inline: false
                        },
                        {
                            name: 'Qualité du travail',
                            value: 'Les employés doivent fournir un **travail de qualité** et respecter les **standards de l\'entreprise**.',
                            inline: false
                        }
                    )
                    .setColor('#E67E22');

                // Embed respect
                const respectEmbed = new EmbedBuilder()
                    .setTitle('🤝 Respect Mutuel')
                    .setDescription('• Le **respect entre collègues** est primordial.\n• Aucun comportement **toxique**, **irrespectueux** ou **discriminatoire** ne sera toléré.')
                    .setColor('#2ECC71');

                // Embed sanctions
                const sanctionsEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Sanctions & Avertissements')
                    .addFields(
                        {
                            name: 'Manquements aux règles',
                            value: 'En cas de **non-respect du règlement**, des sanctions seront appliquées :\n• **1er manquement :** Avertissement verbal\n• **2ème manquement :** Avertissement écrit\n• **3ème manquement :** Rétrogradation ou exclusion',
                            inline: false
                        },
                        {
                            name: '🚨 CUSTOMS SANS PAYER',
                            value: '⚠️ **JAIL / WIPE IMMÉDIAT**\n\nTout employé qui effectue des customisations **sans les déclarer et payer** sera **sanctionné par un JAIL ou un WIPE** sans préavis.\n\n**Aucune exception ne sera tolérée.**',
                            inline: false
                        }
                    )
                    .setColor('#E74C3C');

                // Embed objectif
                const objectifEmbed = new EmbedBuilder()
                    .setDescription('🚀 **Objectif : Maintenir l\'excellence et le professionnalisme chez Harmony Custom !**\n\nEn cas de question, contactez la direction.')
                    .setColor('#1ABC9C');

                await reglementChannel.send({ embeds: [mainEmbed, presenceEmbed, reunionsEmbed, travailEmbed, respectEmbed, sanctionsEmbed, objectifEmbed] });
                await interaction.editReply({ content: `✅ Règlement interne envoyé dans <#${REGLEMENT_CHANNEL_ID}>` });
                console.log('✅ Commande /reglement exécutée');
            } catch (error) {
                console.error('❌ Erreur /reglement:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /debug

        // Slash command /setdata
        if (interaction.commandName === 'setdata') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                // Données de Jayden Jonson
                const jaydenData = {
                    customs: [
                        { id: 1736508044001, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044001 },
                        { id: 1736508044002, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044002 },
                        { id: 1736508044003, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "import", typeLabel: "📦 Import", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044003 },
                        { id: 1736508044004, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044004 },
                        { id: 1736508044005, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044005 },
                        { id: 1736508044006, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "import", typeLabel: "📦 Import", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044006 },
                        { id: 1736508044007, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044007 },
                        { id: 1736508044008, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044008 },
                        { id: 1736508044009, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044009 },
                        { id: 1736508044010, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "gta_online", typeLabel: "🎮 GTA Online", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044010 },
                        { id: 1736508044011, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044011 },
                        { id: 1736508044012, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044012 },
                        { id: 1736508044013, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044013 },
                        { id: 1736508044014, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044014 },
                        { id: 1736508044015, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044015 },
                        { id: 1736508044016, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "import", typeLabel: "📦 Import", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044016 },
                        { id: 1736508044017, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044017 },
                        { id: 1736508044018, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044018 },
                        { id: 1736508044019, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044019 },
                        { id: 1736508044020, userId: "396794712750555138", userTag: "[ER] jayden jonson", type: "boutique", typeLabel: "🛍️ Boutique", montant: 325000, imageUrl: "https://via.placeholder.com/400", timestamp: 1736508044020 }
                    ],
                    quotas: {
                        "396794712750555138": 20
                    }
                };

                // Ajouter les kits vendus
                const payroll = loadPayroll();
                if (!payroll.users) payroll.users = {};
                if (!payroll.users["396794712750555138"]) payroll.users["396794712750555138"] = { kits: 0 };
                payroll.users["396794712750555138"].kits = 11;
                savePayroll(payroll);

                saveCustoms(jaydenData);

                await interaction.editReply({ content: '✅ Données de Jayden Jonson initialisées :\n• 20 customisations\n• Total: 6 500 000$\n• Quota: 20/40\n• Kits vendus: 11' });
                console.log('✅ Commande /setdata exécutée');
            } catch (error) {
                console.error('❌ Erreur /setdata:', error);
                await interaction.editReply({ content: '❌ Une erreur est survenue.' });
            }
        }
        // Slash command /payes
        if (interaction.commandName === 'payes') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const payroll = loadPayroll();
                const fmt = new Intl.NumberFormat('fr-FR');

                // Rôles et pourcentages
                const ROLE_ER = '1288186552249225380'; // 15%
                const ROLE_E = '1351702387198394429';  // 20%
                const ROLE_EE = '1288186576513269843'; // 25%

                // Calculer les payes pour chaque employé
                const embed = new EmbedBuilder()
                    .setTitle('💰 Payes des Employés')
                    .setDescription('Calcul basé sur les factures de customisation + primes kits')
                    .setColor('#F1C40F')
                    .setTimestamp();

                let hasEmployees = false;

                console.log('=== DEBUG /payes ===');
                console.log('Employés dans payroll:', Object.keys(payroll.users || {}).length);

                for (const [userId, payrollData] of Object.entries(payroll.users || {})) {
                    console.log(`\nTraitement de l'employé ${userId} (${payrollData.userTag})`);
                    try {
                        const member = await interaction.guild.members.fetch(userId).catch(() => null);
                        
                        if (!member) {
                            console.log(`❌ Membre ${userId} non trouvé dans le serveur`);
                            // Afficher quand même avec les données de payroll
                            const quota = payrollData.quota || 0;
                            const totalFactures = payrollData.total || 0;
                            const percentage = 15; // Par défaut ER
                            const payeFactures = Math.floor(totalFactures * (percentage / 100));
                            const primeKits = 0; // Pas de kits à priori
                            const payeTotal = payeFactures + primeKits;
                            
                            let statusQuota = '';
                            let warning = '';
                            
                            if (quota < 20) {
                                statusQuota = `❌ Quota: ${quota}/40 (minimum 20 requis)`;
                                warning = '\n⚠️ **NE PAS PAYER** (quota < 20)';
                            } else {
                                statusQuota = quota >= 40 ? `✅ Quota: ${quota}/40` : `🟡 Quota: ${quota}/40`;
                            }

                            embed.addFields({
                                name: `[?] ${payrollData.userTag} (membre non trouvé)`,
                                value: `${statusQuota}\n**Factures:** ${fmt.format(totalFactures)}$ (${percentage}%) = ${fmt.format(payeFactures)}$\n**Kits:** 0 kits → Prime: 0$\n**💵 TOTAL: ${fmt.format(payeTotal)}$**${warning}`,
                                inline: false
                            });
                            hasEmployees = true;
                            continue;
                        }
                        
                        console.log(`✅ Membre trouvé: ${member.displayName}`);
                        
                        let percentage = 0;
                        let grade = 'Inconnu';

                        // Déterminer le pourcentage selon le rôle
                        if (member.roles.cache.has(ROLE_EE)) {
                            percentage = 25;
                            grade = '[EE]';
                        } else if (member.roles.cache.has(ROLE_E)) {
                            percentage = 20;
                            grade = '[E]';
                        } else if (member.roles.cache.has(ROLE_ER)) {
                            percentage = 15;
                            grade = '[ER]';
                        } else {
                            // Pas un employé, on skip
                            console.log(`⚠️ ${member.displayName} n'a pas de rôle employé`);
                            continue;
                        }
                        
                        console.log(`Grade détecté: ${grade} (${percentage}%)`);

                        // Calcul de la paye en utilisant les données de payroll
                        const quota = payrollData.quota || 0;
                        const totalFactures = payrollData.total || 0;
                        const payeFactures = Math.floor(totalFactures * (percentage / 100));
                        const primeKits = 0; // Pas de kits à priori
                        const payeTotal = payeFactures + primeKits;
                        
                        let statusQuota = '';
                        let warning = '';
                        
                        if (quota < 20) {
                            // Quota non atteint
                            statusQuota = `❌ Quota: ${quota}/40 (minimum 20 requis)`;
                            warning = '\n⚠️ **NE PAS PAYER** (quota < 20)';
                        } else {
                            // Quota atteint
                            statusQuota = quota >= 40 ? `✅ Quota: ${quota}/40` : `🟡 Quota: ${quota}/40`;
                            warning = '';
                        }

                        embed.addFields({
                            name: `${grade} ${payrollData.userTag}`,
                            value: `${statusQuota}\n**Factures:** ${fmt.format(totalFactures)}$ (${percentage}%) = ${fmt.format(payeFactures)}$\n**Kits:** 0 kits → Prime: 0$\n**💵 TOTAL: ${fmt.format(payeTotal)}$**${warning}`,
                            inline: false
                        });

                        hasEmployees = true;
                    } catch (error) {
                        console.error(`Erreur pour l'employé ${userId}:`, error);
                    }
                }

                if (!hasEmployees) {
                    embed.setDescription('❌ Aucun employé trouvé avec des données.');
                }

                await interaction.editReply({ embeds: [embed] });
                console.log('✅ Commande /payes exécutée');
            } catch (error) {
                console.error('❌ Erreur /payes:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /reset
        if (interaction.commandName === 'reset') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                // Réinitialiser payroll.json
                const emptyPayroll = { users: {} };
                savePayroll(emptyPayroll);

                // Réinitialiser customs.json
                const emptyCustoms = { customs: [], quotas: {} };
                saveCustoms(emptyCustoms);

                // Remettre tous les channels employés avec 🔴
                const EMPLOYEE_CATEGORY_ID = '1424376634554716322';
                let channelsUpdated = 0;
                
                try {
                    const category = await interaction.guild.channels.fetch(EMPLOYEE_CATEGORY_ID);
                    if (category && category.type === ChannelType.GuildCategory) {
                        const employeeChannels = interaction.guild.channels.cache.filter(
                            c => c.parentId === EMPLOYEE_CATEGORY_ID && c.type === ChannelType.GuildText
                        );
                        
                        for (const [id, channel] of employeeChannels) {
                            if (channel.name.startsWith('🟢')) {
                                const newName = channel.name.replace('🟢', '🔴');
                                await channel.setName(newName);
                                channelsUpdated++;
                                console.log(`✅ Channel réinitialisé: ${newName}`);
                            }
                        }
                    }
                } catch (channelError) {
                    console.error('⚠️ Erreur lors de la mise à jour des channels:', channelError);
                }

                const embed = new EmbedBuilder()
                    .setTitle('🔄 Réinitialisation complète')
                    .setDescription('Toutes les données ont été réinitialisées avec succès !')
                    .addFields(
                        { name: '📦 Kits', value: 'Tous les kits ont été supprimés', inline: true },
                        { name: '🛠️ Customs', value: 'Toutes les customisations ont été supprimées', inline: true },
                        { name: '📊 Factures', value: 'Toutes les factures ont été supprimées', inline: true },
                        { name: '🎯 Quotas', value: 'Tous les quotas ont été réinitialisés', inline: true },
                        { name: '💰 Payes', value: 'Toutes les données de paye ont été effacées', inline: true },
                        { name: '🔴 Channels', value: `${channelsUpdated} channel(s) remis à zéro (🔴)`, inline: true }
                    )
                    .setColor('#E74C3C')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                console.log('✅ Réinitialisation complète effectuée');
            } catch (error) {
                console.error('❌ Erreur /reset:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        // Slash command /facture
        if (interaction.commandName === 'facture') {
            try {
                // Permission admin uniquement
                const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
                }

                await interaction.deferReply();

                const customs = loadCustoms();
                const fmt = new Intl.NumberFormat('fr-FR');

                if (!customs.customs || customs.customs.length === 0) {
                    return interaction.editReply({ content: '❌ Aucune facture de customisation enregistrée pour le moment.' });
                }

                // Calculer le total
                let total = 0;
                const employeeTotals = {};

                for (const custom of customs.customs) {
                    total += custom.montant;
                    if (!employeeTotals[custom.userId]) {
                        employeeTotals[custom.userId] = { total: 0, count: 0, tag: custom.userTag };
                    }
                    employeeTotals[custom.userId].total += custom.montant;
                    employeeTotals[custom.userId].count++;
                }

                const embed = new EmbedBuilder()
                    .setTitle('📊 Récapitulatif des Factures de Customisation')
                    .setDescription(`**Total général:** ${fmt.format(total)} $\n**Nombre de factures:** ${customs.customs.length}\n\n**Par employé:**`)
                    .setColor('#3498DB')
                    .setTimestamp();

                for (const [userId, data] of Object.entries(employeeTotals)) {
                    embed.addFields({
                        name: `👤 ${data.tag}`,
                        value: `Factures: **${data.count}**\nTotal: **${fmt.format(data.total)} $**`,
                        inline: true
                    });
                }

                await interaction.editReply({ embeds: [embed] });
                console.log('✅ Commande /facture exécutée');
            } catch (error) {
                console.error('❌ Erreur /facture:', error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue.' });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
                }
            }
        }
        return; // ne pas traiter comme bouton
    }

    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // Gestion des menus déroulants pour /custom
    if (interaction.isStringSelectMenu() && interaction.customId === 'custom_type_select') {
        const customType = interaction.values[0];
        const userId = interaction.user.id;

        if (activeCustoms.has(userId)) {
            const custom = activeCustoms.get(userId);
            custom.type = customType;
            custom.step = 'montant';

            const typeLabels = {
                'boutique': '🛍️ Boutique',
                'import': '📦 Import',
                'gta_online': '🎮 GTA Online'
            };

            await interaction.update({
                content: `✅ Type sélectionné: **${typeLabels[customType]}**\n\n💰 **Étape 2/3:** Envoyez le montant de la facture (exemple: 50000)`,
                components: []
            });
            
            // Ajouter le message à supprimer
            custom.messagesToDelete.push(interaction.message);
        }
        return;
    }

    if (!interaction.isButton()) return;

    // Bouton pour commencer la candidature
    if (interaction.customId === 'start_application') {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Créer un canal privé pour le CV
            const guild = interaction.guild;
            const channel = await guild.channels.create({
                name: `cv-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            // Initialiser le processus de candidature
            activeApplications.set(interaction.user.id, {
                channelId: channel.id,
                answers: [],
                currentQuestion: 0
            });

            // Envoyer la première question
            const embed = new EmbedBuilder()
                .setTitle('📋 Candidature Harmony\'s')
                .setDescription(`Bienvenue dans votre espace de candidature !\n\n**Question 1/${questions.length}**\n\n${questions[0]}`)
                .setColor('#0099ff')
                .setFooter({ text: 'Répondez à cette question ci-dessous' });

            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Votre espace de candidature a été créé : <#${channel.id}>` });
        } catch (error) {
            console.error('Erreur lors de la création du canal:', error);
            await interaction.editReply({ content: '❌ Une erreur est survenue. Veuillez réessayer.' });
        }
    }

    // Bouton pour annuler /custom
    if (interaction.customId === 'cancel_custom') {
        const userId = interaction.user.id;
        
        if (activeCustoms.has(userId)) {
            const custom = activeCustoms.get(userId);
            
            // Supprimer tous les messages
            try {
                for (const msg of custom.messagesToDelete) {
                    if (msg && msg.deletable) {
                        await msg.delete().catch(() => {});
                    }
                }
            } catch (error) {
                console.error('Erreur suppression messages:', error);
            }
            
            activeCustoms.delete(userId);
            await interaction.update({ content: '❌ Customisation annulée.', components: [], embeds: [] });
            
            // Supprimer le message après 3 secondes
            setTimeout(async () => {
                try {
                    await interaction.message.delete();
                } catch {}
            }, 3000);
        } else {
            await interaction.reply({ content: '❌ Aucune customisation en cours.', ephemeral: true });
        }
    }

    // Bouton pour accepter une candidature
    if (interaction.customId.startsWith('accept_')) {
        const userId = interaction.customId.split('_')[1];
        
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const member = await interaction.guild.members.fetch(userId);
            const role = await interaction.guild.roles.fetch(ROLE_ID);
            
            // Ajouter le rôle
            await member.roles.add(role);
            
            // Envoyer un MP au candidat
            try {
                await member.send(`✅ **Félicitations !**\n\nVotre candidature pour Harmony's a été acceptée !\n\nMerci de bien vouloir indiquer vos disponibilités dans le salon : <#${DISPO_CHANNEL_ID}>\n\nBienvenue dans l'équipe ! 🎉`);
            } catch (dmError) {
                console.warn(`⚠️ Impossible d'envoyer un MP à ${member.displayName}: ${dmError.message}`);
            }
            
            // Envoyer la carte d'identité dans le channel dédié
            if (completedApplications.has(userId)) {
                try {
                    const cvData = completedApplications.get(userId);
                    const idCard = cvData.answers[8]; // 9ème question = carte d'identité
                    const idCardChannel = await client.channels.fetch(ID_CARD_CHANNEL_ID);
                    
                    const idEmbed = new EmbedBuilder()
                        .setTitle('🆔 Nouvelle Carte d\'Identité')
                        .setDescription(`**Employé:** ${member.displayName}\n**Nom:** ${cvData.answers[0]}\n\n**Carte d'identité:**\n${idCard}`)
                        .setColor('#00FF00')
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();
                    
                    await idCardChannel.send({ embeds: [idEmbed] });
                } catch (idError) {
                    console.error('Erreur lors de l\'envoi de la carte d\'identité:', idError);
                }
                completedApplications.delete(userId); // Nettoyage
            }
            
            // Supprimer le channel CV du candidat
            try {
                const cvChannelName = `cv-${member.user.username}`.toLowerCase();
                const cvChannel = interaction.guild.channels.cache.find(c => c.name === cvChannelName);
                if (cvChannel) {
                    await cvChannel.delete();
                    console.log(`✅ Channel CV supprimé: ${cvChannelName}`);
                }
            } catch (cvError) {
                console.warn(`⚠️ Impossible de supprimer le channel CV: ${cvError.message}`);
            }
            
            // Log de l'acceptation (supprime l'embed, garde uniquement le log)
            await interaction.message.delete();
            const reviewChannel = await client.channels.fetch(CV_REVIEW_CHANNEL_ID);
            const accepterMember = await interaction.guild.members.fetch(interaction.user.id);
            await reviewChannel.send(`✅ **Candidature acceptée**\n${member.displayName} (${member.id}) accepté(e) par ${accepterMember.displayName}`);
            
            await interaction.editReply({ content: '✅ Candidature acceptée avec succès !' });
            console.log(`✅ Candidature acceptée pour ${member.displayName}`);
        } catch (error) {
            console.error('Erreur lors de l\'acceptation:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: `❌ Erreur: ${error.message}` });
            } else {
                await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
            }
        }
    }

    // Bouton pour refuser une candidature
    if (interaction.customId.startsWith('reject_')) {
        const userId = interaction.customId.split('_')[1];
        
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const user = await client.users.fetch(userId);
            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            const displayName = member ? member.displayName : user.username;
            
            // Envoyer un MP au candidat
            try {
                await user.send('❌ **Candidature refusée**\n\nMerci de votre temps et de l\'intérêt que vous portez à Harmony\'s.\n\nNous vous encourageons à repostuler plus tard.\n\nCordialement,\nLa Direction');
            } catch (dmError) {
                console.warn(`⚠️ Impossible d'envoyer un MP à ${displayName}: ${dmError.message}`);
            }
            
            // Supprimer le channel CV du candidat
            try {
                const cvChannelName = `cv-${user.username}`.toLowerCase();
                const cvChannel = interaction.guild.channels.cache.find(c => c.name === cvChannelName);
                if (cvChannel) {
                    await cvChannel.delete();
                    console.log(`✅ Channel CV supprimé: ${cvChannelName}`);
                }
            } catch (cvError) {
                console.warn(`⚠️ Impossible de supprimer le channel CV: ${cvError.message}`);
            }
            
            // Log du refus dans le channel de révision
            const reviewChannel = await client.channels.fetch(CV_REVIEW_CHANNEL_ID);
            const rejecterMember = await interaction.guild.members.fetch(interaction.user.id);
            await reviewChannel.send(`❌ **Candidature refusée**\n${displayName} (${user.id}) refusé(e) par ${rejecterMember.displayName}`);
            
            // Supprimer le message du CV
            await interaction.message.delete();
            
            // Nettoyage
            completedApplications.delete(userId);
            
            await interaction.editReply({ content: '✅ Candidature refusée.' });
            console.log(`❌ Candidature refusée pour ${displayName}`);
        } catch (error) {
            console.error('Erreur lors du refus:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: `❌ Erreur: ${error.message}` });
            } else {
                await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
            }
        }
    }

    // Bouton pour créer un ticket Commande
    if (interaction.customId === 'ticket_commande') {
        await createTicket(interaction, 'Commande', COMMANDE_CATEGORY_ID);
    }

    // Bouton pour créer un ticket Contrat
    if (interaction.customId === 'ticket_contrat') {
        await createTicket(interaction, 'Contrat', CONTRAT_CATEGORY_ID);
    }

    // Bouton pour fermer le ticket
    if (interaction.customId === 'close_ticket') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const channel = interaction.channel;
            await interaction.editReply({ content: '🛑 Fermeture du ticket dans quelques secondes...' });
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (err) {
                    console.error('Erreur lors de la suppression du ticket:', err);
                }
            }, 2000);
        } catch (error) {
            console.error('Erreur lors de la fermeture du ticket:', error);
            await interaction.editReply({ content: '❌ Impossible de fermer ce ticket. Vérifiez les permissions.' });
        }
    }
});

// Gérer les messages (pour les réponses aux questions)
client.on('messageCreate', async message => {
    // Ignorer les messages du bot
    if (message.author.bot) return;
    
    // Gérer les customisations en cours
    if (activeCustoms.has(message.author.id)) {
        const custom = activeCustoms.get(message.author.id);
        
        if (message.channel.id !== custom.channelId) return;

        if (custom.step === 'montant') {
            const montant = parseInt(message.content.replace(/\s/g, ''));
            if (isNaN(montant) || montant <= 0) {
                const msgToDelete = await message.reply('❌ Veuillez entrer un montant valide (exemple: 50000)');
                custom.messagesToDelete.push(message, msgToDelete);
                return;
            }
            custom.montant = montant;
            custom.step = 'images';
            const msgToDelete = await message.reply('📸 **Étape 3/3:** Envoyez maintenant **1 capture d\'\u00e9cran** contenant :\n• La facture\n• La carte d\'identité du client\n\n*Envoyez une seule image avec les deux informations.*');
            custom.images = [];
            custom.messagesToDelete.push(message, msgToDelete);
            return;
        }

        if (custom.step === 'images') {
            if (message.attachments.size === 0) {
                const msgToDelete = await message.reply('❌ Veuillez joindre une image.');
                custom.messagesToDelete.push(message, msgToDelete);
                return;
            }

            // Ajouter l'image
            const attachment = message.attachments.first();
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                // Vérifier que l'image est accessible et de taille raisonnable
                if (attachment.size > 8 * 1024 * 1024) { // 8 MB max
                    const msgToDelete = await message.reply('❌ L\'image est trop volumineuse (max 8 MB).');
                    custom.messagesToDelete.push(message, msgToDelete);
                    return;
                }
                // Utiliser l'URL avec le paramètre pour forcer le téléchargement
                const imageUrl = attachment.url;
                custom.images.push(imageUrl);
                custom.messagesToDelete.push(message);
            } else {
                const msgToDelete = await message.reply('❌ Veuillez envoyer une image valide (PNG, JPG, GIF).');
                custom.messagesToDelete.push(message, msgToDelete);
                return;
            }

            if (custom.images.length >= 1) {
                // Enregistrer la customisation
                const customs = loadCustoms();
                const typeLabels = {
                    'boutique': '🛍️ Boutique',
                    'import': '📦 Import',
                    'gta_online': '🎮 GTA Online'
                };

                const newCustom = {
                    id: Date.now(),
                    userId: message.author.id,
                    userTag: message.member.displayName,
                    type: custom.type,
                    typeLabel: typeLabels[custom.type],
                    montant: custom.montant,
                    imageUrl: custom.images[0],
                    timestamp: Date.now()
                };

                customs.customs.push(newCustom);
                
                // Incrémenter le quota
                if (!customs.quotas) customs.quotas = {};
                if (!customs.quotas[message.author.id]) customs.quotas[message.author.id] = 0;
                customs.quotas[message.author.id]++;
                
                const currentQuota = customs.quotas[message.author.id];
                
                saveCustoms(customs);

                // Mettre à jour le channel si quota >= 40
                if (currentQuota >= 40) {
                    try {
                        const channel = message.channel;
                        if (channel.name.startsWith('🔴')) {
                            const newName = channel.name.replace('🔴', '🟢');
                            await channel.setName(newName);
                            console.log(`✅ Channel mis à jour: ${newName}`);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la mise à jour du channel:', error);
                    }
                }

                const fmt = new Intl.NumberFormat('fr-FR');
                const embed = new EmbedBuilder()
                    .setTitle('🛠️ Customisation enregistrée')
                    .setDescription(`**Type:** ${typeLabels[custom.type]}\n**Montant:** ${fmt.format(custom.montant)} $\n**Employé:** ${message.member.displayName}\n\n🎯 **Quota:** ${currentQuota}/40 customs ${currentQuota >= 40 ? '🟢 Atteint !' : currentQuota < 20 ? '🔴 Attention: minimum 20 requis pour être payé' : '🟡 En cours'}`)
                    .setColor('#2ECC71')
                    .setTimestamp()
                    .setImage('attachment://preuve.png');

                // Télécharger l'image originale et la re-attacher
                let imageAttachment = null;
                try {
                    const response = await fetch(custom.images[0]);
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        imageAttachment = new AttachmentBuilder(Buffer.from(buffer), { name: 'preuve.png' });
                    }
                } catch (error) {
                    console.error('Erreur lors du téléchargement de l\'image:', error);
                }

                const messageOptions = { embeds: [embed] };
                if (imageAttachment) {
                    messageOptions.files = [imageAttachment];
                }

                await message.channel.send(messageOptions);

                // Supprimer tous les messages intermédiaires
                setTimeout(async () => {
                    try {
                        for (const msg of custom.messagesToDelete) {
                            if (msg && msg.deletable) {
                                await msg.delete().catch(() => {});
                            }
                        }
                    } catch (error) {
                        console.error('Erreur lors de la suppression des messages:', error);
                    }
                }, 1000);

                activeCustoms.delete(message.author.id);
                console.log(`✅ Customisation enregistrée: ${message.author.tag}`);
            }
            return;
        }
    }
    
    // Vérifier si l'utilisateur a une candidature en cours
    if (!activeApplications.has(message.author.id)) return;
    
    const application = activeApplications.get(message.author.id);
    
    // Vérifier que le message est dans le bon canal
    if (message.channel.id !== application.channelId) return;
    
    // Si c'est la dernière question (carte d'identité), vérifier qu'il y a une pièce jointe
    if (application.currentQuestion === questions.length - 1) {
        if (message.attachments.size === 0) {
            await message.channel.send('❌ **Veuillez joindre une capture d\'écran de votre pièce d\'identité.**\n\nRépondez en envoyant une image.');
            return;
        }
        // Enregistrer l'URL de la pièce jointe
        const attachment = message.attachments.first();
        application.answers.push(attachment.url);
    } else {
        // Enregistrer la réponse texte
        application.answers.push(message.content);
    }
    
    application.currentQuestion++;

    // Si la première question (Nom & Prénom) vient d'être répondue, renommer le membre
    if (application.currentQuestion === 1) {
        const fullname = application.answers[0];
        try {
            if (message.guild) {
                const member = await message.guild.members.fetch(message.author.id);
                await member.setNickname(fullname);
            }
        } catch (error) {
            console.error("Erreur lors du renommage de l'utilisateur:", error);
        }
    }
    
    // Si toutes les questions ont été répondues
    if (application.currentQuestion >= questions.length) {
        // Envoyer le CV au canal de révision
        await sendCVForReview(message.author, application.answers);
        
        // Supprimer le canal après 5 secondes
        setTimeout(async () => {
            try {
                const channel = await client.channels.fetch(application.channelId);
                await channel.delete();
            } catch (error) {
                console.error('Erreur lors de la suppression du canal:', error);
            }
        }, 5000);
        
        // Envoyer un MP de confirmation
        try {
            await message.author.send('✅ **Candidature envoyée**\n\nNous avons bien reçu votre candidature pour Harmony\'s.\n\nNous vous recontacterons bientôt.\n\nMerci pour votre intérêt ! 😊');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du MP de confirmation:', error);
        }
        
        // Supprimer la candidature de la mémoire
        activeApplications.delete(message.author.id);
        
        // Message de confirmation dans le canal avant suppression
        await message.channel.send('✅ **Candidature complétée !**\n\nVotre candidature a été envoyée avec succès.\nCe canal sera supprimé dans quelques secondes.');
    } else {
        // Envoyer la question suivante
        const embed = new EmbedBuilder()
            .setTitle('📋 Candidature Harmony\'s')
            .setDescription(`**Question ${application.currentQuestion + 1}/${questions.length}**\n\n${questions[application.currentQuestion]}`)
            .setColor('#0099ff')
            .setFooter({ text: 'Répondez à cette question ci-dessous' });
        
        await message.channel.send({ embeds: [embed] });
    }
});

// Envoyer le CV pour révision
async function sendCVForReview(user, answers) {
    try {
        const reviewChannel = await client.channels.fetch(CV_REVIEW_CHANNEL_ID);
        
        // Stocker le CV complet pour récupération lors de l'acceptation
        completedApplications.set(user.id, { answers, user });
        
        // Créer l'embed avec les réponses
        let description = `**Candidature de ${user.username}**\n**ID:** ${user.id}\n\n`;
        for (let i = 0; i < questions.length - 1; i++) { // -1 pour exclure la dernière question (image)
            description += `**${questions[i]}**\n${answers[i]}\n\n`;
        }
        
        const idCardUrl = answers[answers.length - 1];
        description += `\n📎 **[Carte d\'identité - Cliquez pour voir](${idCardUrl})**`;
        
        const embed = new EmbedBuilder()
            .setTitle('📄 Nouvelle Candidature')
            .setDescription(description)
            .setColor('#FFD700')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        // Essayer d'ajouter l'image de la carte d'identité
        try {
            embed.setImage(idCardUrl);
        } catch (error) {
            console.log('Impossible d\'ajouter l\'image de la carte d\'identité à l\'embed, lien fourni à la place');
        }
        
        // Boutons d'action
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${user.id}`)
                    .setLabel('✅ Accepter')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_${user.id}`)
                    .setLabel('❌ Refuser')
                    .setStyle(ButtonStyle.Danger)
            );
        
        await reviewChannel.send({ content: `${DIRECTION_ROLE_ID} Nouvelle candidature à examiner !`, embeds: [embed], components: [row] });
        console.log(`✅ CV envoyé pour révision: ${user.tag}`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du CV:', error);
    }
}

// Créer un ticket
async function createTicket(interaction, type, categoryId) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const guild = interaction.guild;
        const channel = await guild.channels.create({
            name: `${type.toLowerCase()}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: STAFF_ROLE_ID,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle(`🎫 Ticket ${type}`)
            .setDescription(`Bienvenue ${interaction.user} !\n\nVotre ticket de type **${type}** a été créé.\n\nUn membre de l'équipe va vous répondre sous peu.\n\nMerci de décrire votre demande en détail.`)
            .setColor('#5865F2')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🛑 Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({ content: `<@&${STAFF_ROLE_ID}> Nouveau ticket **${type}** créé.`, embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ Votre ticket a été créé : <#${channel.id}>` });
        
        console.log(`✅ Ticket ${type} créé pour ${interaction.user.tag}`);
    } catch (error) {
        console.error('Erreur lors de la création du ticket:', error);
        await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création du ticket.' });
    }
}

// Gestion des erreurs et reconnexion automatique
client.on('error', error => {
    console.error('❌ Erreur du bot:', error);
});

client.on('shardError', error => {
    console.error('❌ Erreur du shard:', error);
});

// Reconnexion automatique en cas de déconnexion
client.on('disconnect', () => {
    console.warn('⚠️ Bot déconnecté. Tentative de reconnexion...');
    setTimeout(() => {
        client.login(TOKEN).catch(err => {
            console.error('❌ Erreur de reconnexion:', err);
        });
    }, 5000);
});

// Connexion du bot
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error('❌ Erreur: DISCORD_TOKEN non défini dans les variables d\'environnement');
    process.exit(1);
}
client.login(TOKEN);
