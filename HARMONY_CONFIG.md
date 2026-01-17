# ⚙️ Configuration Harmony Custom Bot

## 🎵 Informations Générales

**Nom de l'entreprise:** Harmony Custom  
**Type:** Customisation de véhicules  
**Discord Server ID:** 1273007405046693888  
**Token:** Voir `.env` (fichier sécurisé non commité)

---

## 📊 Channels Discord

### 📝 Recrutement & CVs
| Channel | ID | Utilité |
|---------|-----|---------|
| #recrutement | 1273007405948735685 | Annonce de recrutement |
| #cv-review | 1461484567587455222 | Révision des CVs |
| #id-archive | 1453169059825717442 | Archive des cartes d'identité |

### 📋 Informations
| Channel | ID | Utilité |
|---------|-----|---------|
| #disponibilités | 1461484851680121034 | Disponibilités des employés |
| #info | 1429580538569822341 | Guide du bot |
| #reglement | 1362546408271384698 | Règlement interne |
| #remuneration | 1387554231724146709 | Info rémunération |

### 💼 Tickets
| Channel | ID | Utilité |
|---------|-----|---------|
| #ticket-announce | 1452476736775258283 | Annonce des tickets |

### 💰 Ventes
| Channel | ID | Utilité |
|---------|-----|---------|
| #ventes-kits | 1461485195877421118 | Ventes de kits |

### 👥 Employés
| Catégorie | ID | Contenu |
|-----------|-----|---------|
| Employés (catégorie) | 1362049732213473360 | Channels privés [ER]/[E]/[EE] |

### 🎫 Tickets
| Catégorie | ID | Contenu |
|-----------|-----|---------|
| Commandes | 1461485731565277347 | Tickets de commandes |
| Contrats | 1461485777232859146 | Tickets de contrats |

---

## 👥 Rôles Discord

### Grades Employés
| Grade | ID | Pourcentage Paye | Description |
|-------|-----|-----------------|-------------|
| [ER] Recrue | 1362086726184472626 | 15% | Nouvel employé |
| [E] Employé | 1210594669789052991 | 20% | Employé confirmé |
| [EE] Expert | 1286055333613011026 | 25% | Employé expert |

### Rôles Spéciaux
| Rôle | ID | Utilité |
|------|-----|---------|
| Citoyen | 1273007405046693889 | Rôle par défaut |
| Direction | 1461486337898053665 | Révision CVs |
| Staff | 1210594673618460733 | Support tickets |

---

## 💰 Système de Rémunération

### Quotas & Paies
- **Quota Objectif:** 40 customisations
- **Minimum Requis:** 20 customisations (sinon 0$ paye)
- **Prime Kits:** 20 kits = +100.000$

### Pourcentages par Grade
- **[ER]:** 15% des factures
- **[E]:** 20% des factures  
- **[EE]:** 25% des factures

### Types de Customisations
| Type | Emoji | Multiplicateur | Plaque |
|------|-------|-----------------|--------|
| Boutique | 🛍️ | x2 | 4 chiffres / 4 lettres (1234 ABCD) |
| Import | 📦 | x2.5 | 2 chiffres / 3 lettres (42 HBC) |
| GTA Online | 🎮 | x10 | 2 chiffres / 3 lettres (12 ABC) |

---

## 🔤 Préfixes & Nommage

### Préfixes des Grades
```
[ER] = Employé Recrue
[E]  = Employé
[EE] = Employé Expert
```

### Emojis Canaux Employés
```
🔴 = Quota non atteint (< 40 customs)
🟢 = Quota atteint (>= 40 customs)
```

### Format Channels
```
🔴-er-[nom]   (Employé recrue en cours)
🔴-e-[nom]    (Employé en cours)
🔴-ee-[nom]   (Expert en cours)
🟢-ee-[nom]   (Expert quota atteint)
```

---

## ⚙️ Commandes Slash

### Pour les Employés
```
/custom      - Enregistrer une customisation
/kit         - Déclarer une vente de kit
```

### Pour les Administrateurs
```
/rc          - Publier annonce de recrutement
/add         - Ajouter un employé
/up          - Promouvoir un employé
/virer       - Licencier un employé
/total-kit   - Stats ventes de kits
/facture     - Récapitulatif des factures
/payes       - Calculer les paies
/reset       - Réinitialiser les données
/remuneration - Publier le règlement rémunération
/reglement   - Publier le règlement interne
/info        - Guide complet du bot
/setdata     - Initialiser données (admin only)
```

---

## 📁 Structure des Données

### payroll.json
```json
{
  "users": {
    "userId": {
      "kits": 0,
      "userTag": "[ER] nom",
      "quota": 0,
      "total": 0,
      "history": [
        {
          "timestamp": 1736508044001,
          "kits": 5,
          "invoiceUrl": "..."
        }
      ]
    }
  }
}
```

### customs.json
```json
{
  "customs": [
    {
      "id": 1736508044001,
      "userId": "userId",
      "userTag": "[ER] nom",
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

## 🚀 Installation & Démarrage

### Étapes
1. **Cloner le repo:** `git clone https://github.com/maxxxxx2603/harmony.git`
2. **Installer dépendances:** `npm install`
3. **Configurer .env:** Ajouter le token Discord
4. **Démarrer:** `npm start`

### NPM Commands
```bash
npm install              # Installer dépendances
npm start               # Lancer le bot
npm run dev             # Mode développement (si configuré)
```

---

## 🔐 Variables d'Environnement

Créez un fichier `.env` à la racine avec:

```env
DISCORD_TOKEN=votre_token_ici
```

⚠️ **Ne jamais commiter le .env** - Fichier ignoré via .gitignore

---

## 📝 Fichiers Importants

- **src/bot.js** - Code principal du bot
- **.env** - Variables d'environnement (Token)
- **package.json** - Dépendances Node.js
- **data/payroll.json** - Données de paies
- **data/customs.json** - Données de customisations
- **DATA_PERSISTENCE.md** - Info persistance données

---

## 🔄 Flux de Travail

### Recrutement
1. Admin utilise `/rc` pour publier annonce
2. Candidat clique "Postuler"
3. Channel privé créé automatiquement
4. Candidat répond à 9 questions
5. CV envoyé à #cv-review
6. Direction accepte/refuse
7. Si accepté: rôle [ER] attribué + channel privé

### Travail
1. Employé utilise `/custom` pour chaque customisation
2. Employé utilise `/kit` pour chaque kit vendu
3. Données sauvegardées automatiquement
4. Quota mis à jour en temps réel
5. Channel émoji changé (🔴 → 🟢) si quota atteint

### Promotion
1. Admin utilise `/up [utilisateur]`
2. Rôle ancien retiré, nouveau rôle ajouté
3. Pseudo renommé [ER] → [E] → [EE]
4. Channel renommé et repositionné

### Paye
1. Admin utilise `/payes` pour voir calculs
2. Paye = (Total factures × Pourcentage) + Prime kits
3. Minimum 20 customs requis
4. [ER] 15%, [E] 20%, [EE] 25%

---

## 📞 Support & Notes

- Les données se sauvegardent toutes les 10 minutes automatiquement
- Les CVs sont supprimés après traitement (accepté/refusé)
- Les channels employés restent privés (sauf admins)
- Les tickets ont leurs propres canaux privés par catégorie

**Dernière mise à jour:** 17 janvier 2026  
**Version:** 1.0.0  
**Entreprise:** Harmony Custom
