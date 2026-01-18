# 🎵 HARMONY BOT - GUIDE COMPLET

## ✅ Installation Terminée

Votre bot Discord pour **Harmony Custom** est maintenant configuré et prêt à être utilisé!

---

## 🚀 Démarrage Rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer le token
Créez un fichier `.env` à la racine:
```env
DISCORD_TOKEN=votre_token_discord_ici
```

⚠️ Voir `.env.example` pour le format exact

### 3. Lancer le bot
```bash
npm start
```

---

## 📋 TOUS LES CHANNELS

### 📝 **RECRUTEMENT & CVs**
- **#recrutement** `1273007405948735685` - Annonce de recrutement
- **#cv-review** `1461484567587455222` - Révision des candidatures
- **#id-archive** `1453169059825717442` - Archive cartes d'identité

### 📊 **INFORMATIONS**
- **#disponibilités** `1461484851680121034` - Disponibilités employés
- **#info** `1429580538569822341` - Guide du bot
- **#reglement** `1362546408271384698` - Règlement interne
- **#remuneration** `1387554231724146709` - Info rémunération

### 💼 **TICKETS & SUPPORT**
- **#ticket-announce** `1452476736775258283` - Annonce tickets
- **Catégorie Commandes** `1461485731565277347` - Tickets commandes
- **Catégorie Contrats** `1461485777232859146` - Tickets contrats

### 💰 **VENTES**
- **#ventes-kits** `1461485195877421118` - Déclaration ventes kits

### 👥 **EMPLOYÉS**
- **Catégorie Employés** `1362049732213473360` - Channels privés [ER]/[E]/[EE]

---

## 👥 TOUS LES RÔLES

### **GRADES EMPLOYÉS**
| Grade | ID | Pourcentage | Description |
|-------|-----|-------------|-------------|
| **[ER]** Recrue | `1362086726184472626` | 15% | Nouvel employé |
| **[E]** Employé | `1210594669789052991` | 20% | Employé confirmé |
| **[EE]** Expert | `1286055333613011026` | 25% | Expert |

### **RÔLES SPÉCIAUX**
- **Citoyen** `1273007405046693889` - Rôle par défaut
- **Direction** `1461486337898053665` - Révision CVs
- **Staff** `1210594673618460733` - Support tickets

---

## ⚡ TOUS LES PRÉFIXES & CODES

### **Préfixes Employés**
```
[ER] = Employé Recrue (15% paye)
[E]  = Employé (20% paye)
[EE] = Employé Expert (25% paye)
```

### **Emojis Canaux**
```
🔴 = Quota EN COURS (< 40 customs)
🟢 = QUOTA ATTEINT (≥ 40 customs)
```

### **Format Canaux Privés**
```
🔴-er-[nom]   → Recrue en cours de travail
🔴-e-[nom]    → Employé en cours de travail
🔴-ee-[nom]   → Expert en cours de travail
🟢-ee-[nom]   → Expert ayant atteint le quota
```

---

## 🛠️ TOUTES LES COMMANDES

### **EMPLOYÉS** (utiliser dans leur channel privé)

| Commande | Utilité |
|----------|---------|
| `/custom` | Enregistrer une customisation (Boutique/Import/GTA Online) |
| `/kit` | Déclarer une vente de kit + facture |

### **ADMINISTRATEURS** (admins seulement)

| Commande | Paramètres | Utilité |
|----------|-----------|---------|
| `/rc` | - | Publier l'annonce de recrutement |
| `/add` | @utilisateur | Ajouter un employé (attribue rôles + channel) |
| `/up` | @utilisateur | Promouvoir (ER→E→EE) |
| `/virer` | @utilisateur | Licencier (supprime channel + rôles) |
| `/total-kit` | - | Stats ventes kits par employé |
| `/facture` | - | Récapitulatif factures customisations |
| `/payes` | - | Calcul paies (avec minimum 20 customs) |
| `/reset` | - | **RÉINITIALISER TOUTES LES DONNÉES** |
| `/remuneration` | - | Publier infos rémunération |
| `/reglement` | - | Publier le règlement interne |
| `/info` | - | Afficher le guide complet |
| `/setdata` | - | Initialiser données de test |

---

## 💰 SYSTÈME DE RÉMUNÉRATION

### **QUOTAS & LIMITES**
- **Objectif:** 40 customisations
- **Minimum requis:** 20 customisations
- **⚠️ Si < 20 customs:** Aucune paye (0$)

### **PAIES PAR GRADE**
```
[ER] = 15% de la facture totale
[E]  = 20% de la facture totale
[EE] = 25% de la facture totale
```

### **PRIME KITS**
```
20 kits vendus   = +100.000$
40 kits vendus   = +200.000$
60 kits vendus   = +300.000$
Etc...
```

### **TYPES CUSTOMISATIONS**

| Type | Emoji | Multiplicateur | Format Plaque |
|------|-------|-----------------|---------------|
| **Boutique** | 🛍️ | x2 | 4 chiffres / 4 lettres (ex: 1234 ABCD) |
| **Import** | 📦 | x2.5 | 2 chiffres / 3 lettres (ex: 42 HBC) |
| **GTA Online** | 🎮 | x10 | 2 chiffres / 3 lettres (ex: 12 ABC) |

#### Exemple de Paye:
```
Employé [E] avec 30 customisations
→ 25 Boutique × 325.000$ × 2 = 16.250.000$
→ 5 Import × 325.000$ × 2.5 = 4.062.500$
→ Total factures = 20.312.500$
→ Paye = 20.312.500$ × 20% = 4.062.500$
→ Kits vendus: 30 → 1 palier atteint = +100.000$
→ PAYE TOTALE = 4.162.500$
```

---

## 📁 STRUCTURE FICHIERS

```
Harmony Bot Nouv/
├── src/
│   └── bot.js              ← Code principal
├── data/
│   ├── payroll.json        ← Données paies
│   └── customs.json        ← Données customisations
├── .env                    ← Token (ne pas commiter)
├── .env.example            ← Exemple config
├── .gitignore              ← Fichiers ignorés
├── package.json            ← Dépendances
├── README.md               ← Documentation
├── HARMONY_CONFIG.md       ← Config complète
├── HARMONY_GUIDE.md        ← CE FICHIER
├── DATA_PERSISTENCE.md     ← Info persistance
└── railway.toml            ← Config Railway (optionnel)
```

---

## 🔄 WORKFLOWS & PROCESSUS

### **1️⃣ RECRUTEMENT**
```
1. Admin: /rc
2. Candidat: Clique "Postuler"
3. Channel privé créé
4. Candidat répond à 9 questions
5. CV envoyé à #cv-review
6. Direction: Accepter/Refuser
7. Si accepté: Rôle [ER] + channel privé
```

### **2️⃣ TRAVAIL QUOTIDIEN**
```
1. Employé: /custom
   - Sélectionne type (Boutique/Import/GTA Online)
   - Entre le montant
   - Envoie screenshot (facture + ID client)
   
2. Employé: /kit
   - Entre nombre de kits
   - Envoie screenshot facture
   
3. Bot:
   - Enregistre automatiquement
   - Met à jour quota
   - Change emoji 🔴→🟢 si quota ≥40
```

### **3️⃣ PROMOTION**
```
1. Admin: /up @utilisateur
2. Bot:
   - Retire ancien rôle
   - Ajoute nouveau rôle
   - Renomme [ER]→[E]→[EE]
   - Renomme channel
   - Repositionne channel
```

### **4️⃣ LICENCIEMENT**
```
1. Admin: /virer @utilisateur
2. Bot:
   - Supprime channel privé
   - Retire tous les rôles employé
   - Garde rôle citoyen
   - Enlève préfixe [ER]/[E]/[EE]
```

### **5️⃣ PAYE**
```
1. Admin: /payes
2. Bot calcule:
   - Total factures × pourcentage grade
   - Prime kits (20 kits = 100k)
   - Vérifie minimum 20 customs
3. Affiche tableau de paye
```

---

## 📊 DONNÉES SAUVEGARDÉES

### **payroll.json**
```json
{
  "users": {
    "userId": {
      "kits": 11,
      "userTag": "[ER] Nom Complet",
      "quota": 20,
      "total": 6500000,
      "history": [
        {
          "timestamp": 1736508044001,
          "kits": 5,
          "invoiceUrl": "..."
        }
      ]
    }
  },
  "lastUpdated": "2026-01-17T12:00:00.000Z"
}
```

### **customs.json**
```json
{
  "customs": [
    {
      "id": 1736508044001,
      "userId": "userId",
      "userTag": "[ER] Nom",
      "type": "boutique",
      "typeLabel": "🛍️ Boutique",
      "montant": 325000,
      "imageUrl": "...",
      "timestamp": 1736508044001
    }
  ],
  "quotas": {
    "userId": 20
  }
}
```

---

## ⚠️ RÈGLES IMPORTANTES

### **Pour les Employés**
✅ Déclarer CHAQUE customisation avec `/custom`  
✅ Déclarer CHAQUE kit vendu avec `/kit`  
✅ Garder screenshot facture + ID client  
✅ Respecter le quota (minimum 20)  
❌ Pas de customs sans déclaration = SANCTION

### **Pour la Direction**
✅ Valider les candidatures  
✅ Ajouter/promouvoir/virer au besoin  
✅ Vérifier les paies mensuellement  
✅ Utiliser `/reset` si réinitialisation nécessaire

### **Automatisations du Bot**
✅ Sauvegarde données toutes les 10 minutes  
✅ Calcul quota en temps réel  
✅ Changement emoji automatique  
✅ Suppression CVs après traitement  
✅ Canaux privés sécurisés

---

## 🔗 GITHUB & GIT

### **Repository**
```
https://github.com/maxxxxx2603/harmony.git
```

### **Commandes Git**
```bash
# Cloner
git clone https://github.com/maxxxxx2603/harmony.git
cd harmony

# Installer & démarrer
npm install
npm start

# Mettre à jour le code
git pull origin main
```

### **⚠️ SÉCURITÉ**
- Le `.env` n'est **JAMAIS** commité
- Le token n'est **JAMAIS** en version control
- Utiliser `.env.example` pour la config

---

## 🆘 TROUBLESHOOTING

### **Le bot ne démarre pas**
```bash
# Vérifier le token
cat .env

# Réinstaller dépendances
rm -r node_modules
npm install

# Relancer
npm start
```

### **Les données ne se sauvegardent pas**
```bash
# Vérifier les permissions du dossier /data
ls -la data/

# Vérifier les fichiers JSON
cat data/payroll.json
```

### **Une commande ne fonctionne pas**
- Vérifier les IDs des channels/rôles
- Vérifier les permissions du bot
- Vérifier les permissions de l'utilisateur

### **Token invalide**
- Régénérer le token sur https://discord.dev/applications
- Mettre à jour `.env`
- Redémarrer le bot

---

## 📞 CONTACT & SUPPORT

**Discord Server:** 1273007405046693888  
**Entreprise:** Harmony Custom  
**Version Bot:** 1.0.0  
**Dernière MAJ:** 17 janvier 2026

---

## 🎯 CHECKLIST SETUP

- [x] Code cloné de GitHub
- [x] .env créé avec token
- [x] npm install exécuté
- [x] Tous les IDs channels/rôles configurés
- [x] Bot lancé et en ligne
- [x] Commandes enregistrées
- [x] Data persistance activée

✅ **PRÊT À L'EMPLOI!**
