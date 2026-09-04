# Backup and restore

Une sauvegarde complete Obikards ERP contient PostgreSQL **et** les photos Inventory. Un dump PostgreSQL seul ne permet pas de reconstruire l'ERP.

## Prerequis

Le serveur applicatif doit fournir `pg_dump`, `pg_restore` et `psql`. Les clients doivent avoir une version majeure au moins egale a celle du serveur PostgreSQL. L'application controle les trois outils et la version du serveur avant chaque operation.

- CI et serveur Nixpacks : PostgreSQL 16 est declare dans la configuration versionnee.
- Windows : installer les outils en ligne de commande PostgreSQL de la meme version majeure que le serveur depuis l'installeur officiel PostgreSQL. Ajouter son repertoire `bin` au `PATH`, ou renseigner les chemins absolus `PG_DUMP_PATH`, `PG_RESTORE_PATH` et `PSQL_PATH`.
- Verifier avec `pg_dump --version`, `pg_restore --version` et `psql --version`.

Les credentials ne sont jamais passes dans les arguments des processus. Le backend transforme `DIRECT_URL` en variables d'environnement `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` et `PGSSLMODE` pour les processus enfants.

## Stockage

`BACKUP_DIR` contient les archives finales. `INVENTORY_PHOTO_DIR` contient les photos actives. Ces deux chemins doivent pointer vers un volume persistant, prive et non servi statiquement. Sur un hebergement a filesystem ephemere, monter un volume pour chacun ou utiliser deux sous-repertoires d'un meme volume.

Valeurs locales par defaut :

```text
backend/data/backups
backend/data/inventory-photos
```

Les deux repertoires sont ignores par Git. Git n'est pas une sauvegarde des donnees applicatives.

## Archive

Une archive `obikards-backup-<UTC>-<UUID>.zip` contient :

```text
manifest.json
database.dump
checksums.sha256
photos/<UUID>.(jpg|png|webp)
```

Le dump utilise le format custom PostgreSQL. Le manifest ne contient aucun secret. Tous les fichiers durables sont controles par SHA-256 avant et apres creation du ZIP.

## API et interface

Toutes les routes `/backups` exigent le role `ADMIN`. Elles permettent de creer, lister, inspecter, telecharger, verifier, restaurer et supprimer une archive. `OPERATOR` n'a aucun acces aux archives ni a leurs metadonnees.

La restauration exige la saisie exacte `RESTAURER <nom-archive>`. Elle execute d'abord un preflight sans modification de donnees, puis cree une sauvegarde de securite de l'etat courant. Les mutations HTTP sont bloquees pendant la fenetre critique. Les sessions restaurees sont supprimees et tous les utilisateurs doivent se reconnecter.

## Changement de PC ou serveur

1. Installer des clients PostgreSQL compatibles.
2. Configurer `DIRECT_URL`, `BACKUP_DIR` et `INVENTORY_PHOTO_DIR`.
3. Copier l'archive dans `BACKUP_DIR` sans la renommer.
4. Lancer le preflight depuis l'interface ADMIN.
5. Mettre l'application en instance unique et lancer la restauration avec la confirmation forte.
6. Verifier les donnees et photos, puis se reconnecter.

## Procedure de secours et limites

Conserver au moins une copie hors du serveur applicatif. Une panne pendant la restauration declenche un rollback depuis la sauvegarde de securite; si le rollback echoue, l'API signale `RESTORE_ROLLBACK_FAILED` et une restauration manuelle avec `pg_restore` est requise.

Le verrou actuel est fiable pour une seule instance Node.js. Avant un deploiement multi-instance, imposer une instance unique pendant backup/restore ou remplacer ce verrou par un verrou distribue PostgreSQL. La planification, retention automatique, S3, chiffrement avec gestion de cles, snapshots fournisseur et point-in-time recovery restent hors Sprint 28.