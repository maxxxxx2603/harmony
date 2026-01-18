# 🔍 FIND & REPLACE GUIDE - TOUS LES IDS LIGNE PAR LIGNE

## Comment utiliser ce guide

1. Ouvre `src/bot.js`
2. Appuie sur `Ctrl+H` pour ouvrir Find & Replace
3. Pour chaque ligne ci-dessous, remplace l'ID ancien par le nouveau
4. Teste le bot avec `npm start`

---

## 📋 TOUS LES IDS À REMPLACER (Ordre apparition dans le code)

### LIGNE 16 - ANNOUNCE_CHANNEL_ID
```javascript
// AVANT:
const ANNOUNCE_CHANNEL_ID = '1377365506700345466';

// APRÈS:
const ANNOUNCE_CHANNEL_ID = 'TON_ID_ANNOUNCE';
```
**Find:** `1377365506700345466`  
**Replace with:** `ton_announce_id`

---

### LIGNE 17 - CV_REVIEW_CHANNEL_ID
```javascript
// AVANT:
const CV_REVIEW_CHANNEL_ID = '1461484567587455222';

// APRÈS:
const CV_REVIEW_CHANNEL_ID = 'TON_ID_CV_REVIEW';
```
**Find:** `1461484567587455222`  
**Replace with:** `ton_cv_review_id`

---

### LIGNE 18 - DISPO_CHANNEL_ID
```javascript
// AVANT:
const DISPO_CHANNEL_ID = '1461484851680121034';

// APRÈS:
const DISPO_CHANNEL_ID = 'TON_ID_DISPO';
```
**Find:** `1461484851680121034`  
**Replace with:** `ton_dispo_id`

---

### LIGNE 21 - SALES_CHANNEL_ID
```javascript
// AVANT:
const SALES_CHANNEL_ID = '1461485195877421118';

// APRÈS:
const SALES_CHANNEL_ID = 'TON_ID_SALES';
```
**Find:** `1461485195877421118`  
**Replace with:** `ton_sales_id`

---

### LIGNE 28 - RECRUIT_ANNOUNCE_CHANNEL_ID
```javascript
// AVANT:
const RECRUIT_ANNOUNCE_CHANNEL_ID = '1273007405948735685';

// APRÈS:
const RECRUIT_ANNOUNCE_CHANNEL_ID = 'TON_ID_RECRUIT';
```
**Find:** `1273007405948735685`  
**Replace with:** `ton_recruit_announce_id`

---

### LIGNE 29 - GUILD_ID ⚠️ TRÈS IMPORTANT
```javascript
// AVANT:
const GUILD_ID = '1273007405046693888';

// APRÈS:
const GUILD_ID = 'TON_GUILD_ID';
```
**Find:** `1273007405046693888`  
**Replace with:** `ton_guild_id`

**⚠️ C'EST LE PLUS IMPORTANT - Le serveur entier dépend de cet ID!**

---

### LIGNE 31 - CITIZEN_ROLE_ID
```javascript
// AVANT:
const CITIZEN_ROLE_ID = '1273007405046693889';

// APRÈS:
const CITIZEN_ROLE_ID = 'TON_CITIZEN_ROLE_ID';
```
**Find:** `1273007405046693889`  
**Replace with:** `ton_citizen_role_id`

---

### LIGNE 33 - ID_CARD_CHANNEL_ID
```javascript
// AVANT:
const ID_CARD_CHANNEL_ID = '1453169059825717442';

// APRÈS:
const ID_CARD_CHANNEL_ID = 'TON_ID_CARD_ID';
```
**Find:** `1453169059825717442`  
**Replace with:** `ton_id_card_id`

---

### LIGNE 34 - DIRECTION_ROLE_ID
```javascript
// AVANT:
const DIRECTION_ROLE_ID = '1461486337898053665';

// APRÈS:
const DIRECTION_ROLE_ID = 'TON_DIRECTION_ROLE_ID';
```
**Find:** `1461486337898053665`  
**Replace with:** `ton_direction_role_id`

---

### LIGNE 35 - COMMANDE_CATEGORY_ID
```javascript
// AVANT:
const COMMANDE_CATEGORY_ID = '1461485731565277347';

// APRÈS:
const COMMANDE_CATEGORY_ID = 'TON_COMMANDE_CATEGORY_ID';
```
**Find:** `1461485731565277347`  
**Replace with:** `ton_commande_category_id`

⚠️ **CATÉGORIE** (pas un channel!) pour les tickets de commandes

---

### LIGNE 36 - CONTRAT_CATEGORY_ID
```javascript
// AVANT:
const CONTRAT_CATEGORY_ID = '1461485777232859146';

// APRÈS:
const CONTRAT_CATEGORY_ID = 'TON_CONTRAT_CATEGORY_ID';
```
**Find:** `1461485777232859146`  
**Replace with:** `ton_contrat_category_id`

⚠️ **CATÉGORIE** (pas un channel!) pour les tickets de contrats

---

### LIGNE 37 - TICKET_ANNOUNCE_CHANNEL_ID
```javascript
// AVANT:
const TICKET_ANNOUNCE_CHANNEL_ID = '1452476736775258283';

// APRÈS:
const TICKET_ANNOUNCE_CHANNEL_ID = 'TON_TICKET_ANNOUNCE_ID';
```
**Find:** `1452476736775258283`  
**Replace with:** `ton_ticket_announce_id`

---

### LIGNE ~331 & 749 - EMPLOYEE_CATEGORY_ID
```javascript
// AVANT:
const EMPLOYEE_CATEGORY_ID = '1362049732213473360';

// APRÈS:
const EMPLOYEE_CATEGORY_ID = 'TON_EMPLOYEE_CATEGORY_ID';
```
**Find:** `1362049732213473360`  
**Replace with:** `ton_employee_category_id`

⚠️ **CATÉGORIE** pour les channels privés des employés  
**Cet ID apparaît 2 fois dans le code - remplacer partout!**

---

### LIGNE ~500 (multiples) - RÔLES EMPLOYÉS

#### ROLE_ER (15% de paye)
```javascript
// AVANT:
const role1 = await interaction.guild.roles.fetch('1362086726184472626');

// APRÈS:
const role1 = await interaction.guild.roles.fetch('TON_ROLE_ER_ID');
```
**Find:** `1362086726184472626`  
**Replace with:** `ton_role_er_id`

**Cherche aussi cette ID dans:**
- Promotion (ER → E)
- Ajout d'employé

---

#### ROLE_E (20% de paye)
```javascript
// AVANT:
const role2 = await interaction.guild.roles.fetch('1210594669789052991');

// APRÈS:
const role2 = await interaction.guild.roles.fetch('TON_ROLE_E_ID');
```
**Find:** `1210594669789052991`  
**Replace with:** `ton_role_e_id`

---

#### ROLE_EE (25% de paye)
```javascript
// AVANT:
const roleToAdd = await interaction.guild.roles.fetch('1286055333613011026');

// APRÈS:
const roleToAdd = await interaction.guild.roles.fetch('TON_ROLE_EE_ID');
```
**Find:** `1286055333613011026`  
**Replace with:** `ton_role_ee_id`

---

### AUTRES IDS À CHERCHER

#### ROLE_ID_KEEP (dans /virer)
**Find:** `1210594673618460733`  
**Replace with:** `ton_staff_role_id`

Cette est le rôle qui reste après licenciement

---

#### INFO_CHANNEL_ID (dans /info)
Cherche cette ligne dans le code:
```javascript
const INFO_CHANNEL_ID = '1429580538569822341';
```
**Find:** `1429580538569822341`  
**Replace with:** `ton_info_channel_id`

---

#### REGLEMENT_CHANNEL_ID (dans /remuneration et /reglement)
Cherche ces lignes dans le code:
```javascript
const REGLEMENT_CHANNEL_ID = '1387554231724146709';
```
**Find:** `1387554231724146709`  
**Replace with:** `ton_reglement_channel_id`

---

## 🎯 RÉSUMÉ DES REPLACEMENTS

### Channels (13 IDs):
```
1377365506700345466 → ANNOUNCE
1461484567587455222 → CV_REVIEW
1461484851680121034 → DISPO
1461485195877421118 → SALES
1273007405948735685 → RECRUIT_ANNOUNCE
1453169059825717442 → ID_CARD
1452476736775258283 → TICKET_ANNOUNCE
1429580538569822341 → INFO
1387554231724146709 → REGLEMENT
1362546408271384698 → AUTRE (vérifie ce que c'est!)
1210594716802883604 → CVs channel (dans strings)
[+2 autres si nécessaire]
```

### Categories (3 IDs):
```
1461485731565277347 → COMMANDE_CATEGORY
1461485777232859146 → CONTRAT_CATEGORY
1362049732213473360 → EMPLOYEE_CATEGORY (x2 occurrences!)
```

### Guild (1 ID):
```
1273007405046693888 → GUILD_ID ⚠️ CRITIQUE!
```

### Rôles (7 IDs):
```
1362086726184472626 → ROLE_ER
1210594669789052991 → ROLE_E
1286055333613011026 → ROLE_EE
1273007405046693889 → CITIZEN_ROLE
1461486337898053665 → DIRECTION_ROLE
1210594673618460733 → STAFF_ROLE
```

---

## ✅ VÉRIFICATION FINALE

Après tous les replacements:

1. **Sauvegarde** le fichier (Ctrl+S)
2. **Ouvre le terminal**:
   ```bash
   npm start
   ```
3. **Cherche les erreurs** comme:
   - "Unknown Guild"
   - "Unknown Channel"
   - "Unknown Role"

Si tu vois ces erreurs, c'est qu'un ID est mauvais!

---

## 🆘 EN CAS D'ERREUR

Si le bot ne démarre pas:

1. Regarde l'erreur dans la console
2. Note le nom du channel/rôle/serveur manquant
3. Va sur Discord, copie le bon ID
4. Reviens dans le code et remplace

Astuce: Utilise `git diff` pour voir exactement ce qui a changé:
```bash
git diff src/bot.js
```

---

**Prêt à remplacer? Ouvre src/bot.js et lance Ctrl+H!** 🚀
