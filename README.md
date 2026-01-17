# 🎵 Harmony Custom - Bot de Gestion Discord

Bot Discord complet pour la gestion d'une entreprise de customisation de véhicules chez Harmony Custom.

## 🎯 Fonctionnalités Principales

### 👥 Système de Recrutement
- Candidatures automatisées avec 9 questions
- Création de channels privés pour chaque candidat
- Système d'acceptation/refus par la direction
- Archive automatique des cartes d'identité

### 💼 Gestion des Employés
- 3 grades : **[ER]** Recrue / **[E]** Employé / **[EE]** Expert
- Channels privés par employé
- Promotion automatique avec renommage
- Licenciement avec nettoyage complet

### 🛠️ Système de Customisations
- Enregistrement des customisations (Boutique/Import/GTA Online)
- Système de quotas (40 customs = objectif)
- Génération automatique de factures
- Calcul de payes basé sur les performances

### 📦 Gestion des Kits
- Suivi des ventes de kits de réparation
- Primes automatiques tous les 20 kits (+100.000$)
- Historique des ventes

### 💰 Système de Paies
- **[ER]** : 15% des factures
- **[E]** : 20% des factures
- **[EE]** : 25% des factures
- Minimum 20 customs pour être payé

### 🎫 Tickets Support
- Système de tickets par catégorie
- Tickets Commande & Contrat
- Canaux privés pour chaque ticket

## 📋 Commandes

### Employés
- `/custom` - Enregistrer une customisation
- `/kit` - Déclarer une vente de kit

### Administration
- `/rc` - Publier l'annonce de recrutement
- `/add [utilisateur]` - Ajouter un employé
- `/up [utilisateur]` - Promouvoir un employé
- `/virer [utilisateur]` - Licencier un employé
- `/total-kit` - Voir les stats de kits
- `/facture` - Voir les factures
- `/payes` - Calculer les paies
- `/reset` - Réinitialiser les données
- `/remuneration` - Publier le règlement de rémunération
- `/reglement` - Publier le règlement interne
- `/info` - Afficher l'aide complète

## 🚀 Installation

### Prérequis
- Node.js 16+
- Discord.js 14+

### Setup
1. Clonez le repository
2. Installez les dépendances : `npm install`
3. Configurez le `.env` avec votre token Discord
4. Lancez le bot : `npm start`

## 📊 Structure des Données

### payroll.json
```json
{
  "users": {
    "userId": {
      "kits": 0,
      "history": []
    }
  }
}
```

### customs.json
```json
{
  "customs": [],
  "quotas": {}
}
```

## 🛡️ Permissions

- **Admin** : Toutes les commandes d'administration
- **Employés** : Commandes de customisations et kits
- **Direction** : Révision des candidatures

## 📝 Notes

- Les données sont sauvegardées automatiquement toutes les 10 minutes
- Les canaux employés sont nommés avec un emoji (🔴 en cours / 🟢 quota atteint)
- Les CVs sont supprimés après l'acceptation ou le refus

---
**Harmony Custom © 2026**
