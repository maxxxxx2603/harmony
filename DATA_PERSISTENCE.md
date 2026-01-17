# Railway Volume Setup

Ce projet utilise un **Railway Volume** pour sauvegarder les données de façon permanente.

## Configuration

Le dossier `data/` est monté sur un volume persistent Railway :
- `payroll.json` - Données des kits vendus
- `customs.json` - Données des customisations et quotas

Les données sont **sauvegardées automatiquement** à chaque modification et **persistent après chaque redéploiement**.

## Railway Volume

Le volume est configuré dans `railway.toml` :
```toml
[[mounts]]
mountPath = "/app/data"
```

Cela garantit qu'aucune donnée ne sera perdue lors des redéploiements.
