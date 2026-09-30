# El aula 1 en casa

Site des classes d'espagnol de Lucas : des séquences partagées par niveau, des
cours (document + corrigé dévoilé classe par classe + entraînement +
approfondissement), et un parcours de **Remise à niveau** (Conexión español)
pour reprendre toutes les bases.

## Architecture

- **Next.js sur Vercel** (plan Hobby, gratuit).
- **Turso** (SQLite distribué, gratuit) pour les séquences, cours, exercices,
  corrigés, ressources et le contenu de l'accueil.
- **Vercel Blob** pour les fichiers (PDF, images, audio, vidéo, Word…),
  envoyés directement depuis le navigateur (50 Mo max par fichier).
- **Deux mots de passe distincts** : un par classe (élèves), un admin
  (professeur, `/admin`). Pas de comptes, pas d'e-mail, pas de données
  personnelles collectées.
- Le professeur connecté peut ouvrir n'importe quel espace classe pour voir ce
  que voient les élèves (brouillons compris, signalés par un bandeau).

## Style

Identité de la famille « Focus » : fond bleu nuit, accents turquoise / corail /
soleil, cartes arrondies, police Lexend (Google Fonts, chargée par
`next/font`). Les couleurs sont des variables dans `app/globals.css`.

## Séquences et cours (`/admin`)

1. **Nouvelle séquence** : un titre et les classes qui la suivent (raccourcis
   « Toutes les 3e », « Toutes les classes »). Une séquence n'apparaît chez les
   élèves que lorsqu'elle contient au moins un cours publié.
2. **Cours** : dans la séquence, ajoute des cours (réordonnables). Chaque cours a :
   - un **document** (fichier glissé-déposé) ;
   - un **corrigé** à côté du document, découpé en blocs (un par exercice).
     Chaque bloc se dévoile **classe par classe** : un bloc sans classe cochée
     reste caché, ce qui permet de préparer la correction à l'avance et de la
     montrer à la 3A lundi, à la 3B jeudi. Enregistrement automatique. Les
     blocs non dévoilés ne sont jamais envoyés au navigateur de la classe ;
   - des exercices d'**Entraînement** et d'**Approfondissement**, de deux
     types : **Fichier** (document + son propre corrigé dévoilable) ou **QCM**
     (questions à choix unique avec indice et explication, corrigées
     automatiquement ; bouton « Tester comme un élève »).
3. **Publier** : un cours reste en brouillon (invisible pour les élèves) tant
   que tu ne cliques pas sur « Publier le cours ».

Supprimer une séquence ou un cours supprime aussi ses exercices, corrigés et
fichiers stockés.

Le QCM suit l'arbre de décision du kit Conexión : bonne réponse → explication ;
1re erreur → indice + nouvel essai ; 2e erreur → solution expliquée + nouvel
essai ; erreur persistante → on continue, question marquée « à consolider ».

## Remise à niveau (Conexión español)

Accessible depuis chaque espace classe, **uniquement aux élèves connectés**
(`/matiere/espagnol/<classe>/remise-a-niveau`).

- 12 modules S01 → S12, chacun en 6 étapes : Découvrir, Comprendre,
  S'entraîner, Copier, Appliquer, Vérifier. En bas de chaque écran : « Besoin
  d'aide », « Ma leçon », « Ma fiche » (ouvre la bonne page du dossier élève).
- Bilans B01 (après S04), B02 (après S08), B03 (après S11) : questions sans
  indice d'office ; seuil atteint → suite ; sinon modules à revoir + nouvel essai.
- Mémos : toutes les leçons, lexique, verbes essentiels, nombres.
- Progression **gardée sur l'appareil de l'élève** (aucune donnée envoyée au
  serveur), avec des états honnêtes (À commencer, En cours, Terminé avec / sans
  aide, À consolider) et un **code de reprise** pour continuer sur un autre
  appareil. Le professeur ne voit donc pas la progression des élèves.

### Modifier le parcours (`/admin/remise`)

Le kit (`lib/remise/parcours.json`) reste la base. Depuis l'espace enseignant,
carte « Remise à niveau », tu peux modifier chaque module : titre, objectif,
visuel, document, **audio** (envoi d'un fichier MP3/M4A…) et sa transcription,
repères, lexique, questions d'entraînement, leçon à recopier, activités de la
fiche, mission et aides, question de sortie, correction, modèle et critères.
Chaque bilan est modifiable aussi (questions, module à revoir, nouvel essai,
seuil). Tes modifications sont enregistrées en base (table `remise_overrides`) ;
le bouton « Version du kit » remet un module ou un bilan dans son état
d'origine. Tu peux aussi remplacer le dossier élève PDF (sinon celui du kit,
`public/remise/Conexion_espanol_Dossier_eleve.pdf`, est utilisé).

La structure reste fixe : 12 modules et 3 bilans (on modifie leur contenu,
on n'en ajoute pas).

Sans enregistrement audio, les élèves ont la voix de synthèse espagnole du
navigateur et la transcription ; si l'élève lit la transcription sans écouter,
la compréhension orale est marquée « non évaluée ».

## Fil d'actualité (`/admin/actualites`)

Trois types de publications : **Info**, **Document**, **Production d'élève**
(avec l'auteur, prénom et classe). Chaque publication peut avoir un texte (les
liens deviennent cliquables), un fichier (image affichée en grand, audio et
vidéo lisibles, autres fichiers à télécharger) et un lien. On peut l'épingler en
haut du fil.

Visibilité, au choix pour chaque publication :
- **Tout le monde** : sur l'accueil public et la page `/actualites` ;
- **Certaines classes** : seulement dans l'espace de ces classes (protégé par
  leur mot de passe). C'est le réglage proposé par défaut pour les productions
  d'élèves, puisque l'accueil est public : prénom seulement, pas de visage
  reconnaissable sans autorisation.

## Tableau de classe (`/tableau`)

Un tableau à projeter en classe, dans l'esprit de Classroomscreen, réservé au
professeur connecté (lien depuis l'espace enseignant). Outils à ajouter depuis
le dock du bas, déplaçables (par leur en-tête) et redimensionnables (poignée en
bas à droite, ou boutons − / + ; double-clic sur la poignée : taille d'origine) :
minuteur (avec alarme), chronomètre, horloge avec la date en espagnol (« Hoy es
lunes… ») ou en français, tirage au sort sans remise, groupes aléatoires, feu
tricolore, consignes de travail bilingues (En silencio, En parejas, Levanta la
mano…), sonomètre (micro), texte libre, dés, QR code vers l'espace de la classe.
Fonds au choix, plein écran. La disposition et les **prénoms des élèves** sont
gardés uniquement dans le navigateur de l'ordinateur utilisé (jamais envoyés en
ligne) : à saisir une fois par classe sur l'ordinateur de la salle.

## Page d'accueil éditable

Sur `/admin`, le premier bloc ("Page d'accueil") permet de changer le titre et
le sous-titre de la bannière d'accueil, et d'ajouter un message optionnel
(actualité, rappel de contrôle...) affiché sous la bannière. Enregistré en
base, visible immédiatement — aucun redéploiement nécessaire.

## Ressources

Le bloc "Ressources" sur `/admin` permet d'ajouter, modifier et supprimer les
ressources affichées sur `/ressources` (titre, description optionnelle, URL)
— aucune modification de code nécessaire.

## Stockage des fichiers (Vercel Blob) — à faire une fois

1. Sur Vercel (pas sur GitHub) : ton projet → **Storage** → **Create** → **Blob**.
2. Accès : **Public** (indispensable : les documents s'affichent directement
   aux élèves ; un store « Private » ne fonctionne pas avec ce site).
3. Coche au moins l'environnement **Production** et connecte le store au projet.
   Vercel ajoute `BLOB_STORE_ID` et `BLOB_READ_WRITE_TOKEN` ; ce dernier est
   **indispensable** pour envoyer des fichiers depuis le navigateur.
4. **Redéploie** (Deployments → ⋯ → Redeploy) : les variables ne sont prises en
   compte qu'au déploiement suivant.
5. Dans l'espace enseignant → Réglages du site → **Vérifier le stockage** : le
   site envoie puis supprime un petit fichier de test et t'explique quoi
   corriger si quelque chose bloque.

En local, `vercel env pull` copie les variables dans `.env.local` (si elles
n'apparaissent pas, ajoute l'environnement Development à la connexion du store).

L'URL d'un fichier contient un suffixe aléatoire impossible à deviner, mais
quelqu'un qui possède le lien direct peut l'ouvrir sans mot de passe. Les pages
des classes, elles, restent protégées.

## Ancienne version

Les séances importées depuis ClassPro et les « documents partagés » ont été
retirés. Leurs tables (`seances`, `import_log`, `documents_partages`) restent en
base pour ne rien perdre, mais ne sont plus lues.

## Ajouter une classe ou une (autre) matière

`lib/classes.ts` contient déjà les 7 classes d'espagnol de ton export
(3A → 3F, 4A). Pour en ajouter une nouvelle, ou une autre matière si tu en
reprends une un jour, ajoute une entrée dans le tableau, avec un
`passwordEnvVar` (le nom de la variable d'environnement qui contiendra le mot
de passe, en clair). Le `classeSlug` doit être en minuscules et correspondre à
ce que génère le parseur (ex: la classe "3E" devient `3e`).

## Définir un mot de passe (classe ou admin)

Pas de génération à faire : le mot de passe est stocké tel quel dans la
variable d'environnement correspondante (`CLASS_..._PASSWORD` ou
`ADMIN_PASSWORD`), sur Vercel comme dans `.env.local`. La comparaison au
moment du login se fait en temps constant (`lib/password.ts`), pour éviter les
attaques par mesure de timing malgré l'absence de hash.

C'est un choix délibéré de simplicité pour un mot de passe de classe partagé,
pas un compte individuel à forte valeur — si tes besoins changent, on peut
toujours repasser à un hash plus tard.

Un changement de variable d'environnement sur Vercel nécessite un
redéploiement pour être pris en compte (un clic depuis le dashboard).

## Lancer en local

```bash
npm install
cp .env.example .env.local
# TURSO_DATABASE_URL=file:local.db fonctionne tel quel, aucun compte Turso requis en local
# renseigne ADMIN_PASSWORD et au moins une variable CLASS_..._PASSWORD dans .env.local
npm run dev
```

## Déployer sur Vercel (gratuit)

1. Pousse ce projet sur un repo GitHub.
2. Crée une base sur [turso.tech](https://turso.tech) (plan gratuit) :
   `turso db create espace-eleves`, puis `turso db show espace-eleves` et
   `turso db tokens create espace-eleves` pour récupérer l'URL et le token.
3. Sur [vercel.com](https://vercel.com), "Add New Project" → importe le repo.
4. Dans Environment Variables, ajoute `SESSION_SECRET`, `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `ADMIN_PASSWORD`, et un mot de passe par classe.
   Crée aussi le store Vercel Blob (voir plus haut).
5. Déploie. Le schéma de base se crée tout seul au premier appel, rien à migrer
   à la main.

## Limitation connue

Le cookie de session élève ne retient qu'une seule classe à la fois. Un élève qui
a plusieurs matières protégées devra se reconnecter en changeant de classe. Si ça
devient gênant, on peut faire évoluer le token pour retenir plusieurs classes
accédées — dis-le-moi.
