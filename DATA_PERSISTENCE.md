# 💾 Persistance des Données - Harmony Bot

## Vue d'ensemble

Ce projet utilise une **persistance locale basée sur fichiers JSON** pour sauvegarder les données de façon permanente et sécurisée.

## Structure des données

Le dossier `data/` contient deux fichiers JSON essentiels:
- **`payroll.json`** - Données des kits vendus et historique paies
- **`customs.json`** - Données des customisations et quotas par employé

## Sauvegarde automatique

Les données sont **sauvegardées automatiquement toutes les 10 minutes** par le bot via le code suivant:

```javascript
setInterval(() => {
    const payroll = loadPayroll();
    const customs = loadCustoms();
    
    payroll.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PAYROLL_FILE, JSON.stringify(payroll, null, 2));
    fs.writeFileSync(CUSTOMS_FILE, JSON.stringify(customs, null, 2));
}, 10 * 60 * 1000);
```

## Avantages de cette approche

✅ **Simple** - Pas de base de données externe requise  
✅ **Portable** - Les données restent avec le code  
✅ **Sûr** - Fichiers versionnable en Git (si souhaité)  
✅ **Rapide** - Pas de latence réseau  
✅ **Durable** - Les données persistent entre les redémarrages

## Localisation des fichiers

Lors du démarrage local:
```
c:\Users\maxim\Harmony Bot Nouv\data\
├── payroll.json
└── customs.json
```

## Format des données

### payroll.json
```json
{
  "users": {
    "userId": {
      "kits": 11,
      "userTag": "[ER] Nom",
      "quota": 20,
      "total": 6500000,
      "history": []
    }
  },
  "lastUpdated": "2026-01-17T12:00:00.000Z"
}
```

### customs.json
```json
{
  "customs": [
    {
      "id": 1736508044001,
      "userId": "userId",
      "userTag": "[ER] Nom",
      "type": "boutique",
      "montant": 325000,
      "imageUrl": "..."
    }
  ],
  "quotas": {"userId": 20}
}
```

## Déploiement sur un serveur

Pour déployer sur un serveur avec persistance:
1. S'assurer que le dossier `/app/data` existe
2. Mapper les volumes: `docker run -v /app/data:/data ...`
3. Ou utiliser Railway/Render avec volumes persistants

## Sauvegardes manuelles

Pour sauvegarder manuellement:
```bash
cp -r data/ backups/backup-$(date +%Y%m%d_%H%M%S)/
```

## Récupération en cas d'erreur

Si les fichiers JSON sont corrompus:
1. Arrêter le bot
2. Supprimer les fichiers corrompus
3. Redémarrer le bot (il créera des fichiers vides)
4. Restaurer depuis une sauvegarde

Les données sont **persistantes et sécurisées** ✅
