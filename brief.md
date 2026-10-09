# Brief de Conception — Devisexpress

## 1. Contexte & Problématique

En Suisse romande, beaucoup d'artisans indépendants (peintres, plâtriers, carreleurs) rédigent encore leurs devis à la main dans Word, en recopiant à chaque fois leurs coordonnées, leurs prix et en calculant la TVA eux-mêmes. Cela leur prend 30 à 45 minutes par devis, souvent le soir, et les erreurs de calcul font perdre de l'argent ou de la crédibilité. Devisexpress permet de composer un devis sur son téléphone, juste après la visite du chantier, à partir d'un catalogue de prestations déjà enregistré, et de le générer en PDF en moins de 5 minutes.

## 2. Profil de l'Utilisateur Cible (Persona)

- **Prénom & Âge :** Marc, 38 ans, peintre en bâtiment indépendant à Yverdon-les-Bains (détails : [design/persona.md](mon_app/design/persona.md))
- **Contexte d'utilisation :** dans sa camionnette après la visite d'un chantier, smartphone 390 px tenu d'une main, réseau parfois faible
- **Besoins clés :** zéro ressaisie, total et TVA (8,1 %) calculés et visibles en direct, gros boutons, texte lisible en plein soleil

## 3. Fonctionnalités Essentielles (Périmètre MVP)

1. Affichage du catalogue des prestations (fichier JSON de 30+ fiches) sous forme de cartes : nom, catégorie, prix et unité.
2. Filtrage instantané par catégorie (Peinture intérieure, Façade, Préparation, Forfaits) et recherche dynamique par mot-clé.
3. Consultation d'une fiche prestation détaillée avec choix de la quantité et total de la ligne en direct.
4. Ajout de la prestation au devis en cours, avec confirmation visuelle et bandeau « Devis en cours » toujours visible.
5. Récapitulatif du devis (client, lignes, HT, TVA 8,1 %, TTC) et génération du PDF avec l'impression du navigateur.
6. Formulaire « Mon entreprise » validé (nom, adresse, IBAN, n° TVA) avec messages d'erreur sous les champs, sans `alert`.

Hors MVP (bonus si le temps le permet) : export Word, envoi par e-mail, historique des devis.

## 4. Contraintes Techniques & Ergonomiques

- **Approche :** Mobile First (largeur de référence 390 px), puis adaptation tablette et ordinateur.
- **Technologie :** Vanilla HTML5 sémantique, CSS moderne avec variables, JavaScript natif sans bibliothèque. Données chargées avec `fetch` depuis un fichier JSON. Publication sur GitHub Pages.
- **Accessibilité :** Ratios de contraste WCAG AA (≥ 4,5:1), navigation clavier assurée (Tab / Entrée, focus visible), cibles tactiles ≥ 48 × 48 px, texte de base ≥ 16 px.
- **Données :** inventées (prestations, clients, entreprise) ; les infos de l'entreprise et le devis en cours sont gardés dans le navigateur (`localStorage`).

## 5. Écrans

- Écran 1 : Accueil — catalogue des prestations
- Écran 2 : Vue filtrée / recherche
- Écran 3 : Fiche prestation détaillée
- Écran 4 : Récapitulatif du devis et génération du PDF

Wireframes : [design/wireframes/](mon_app/design/wireframes/) · Parcours : [design/user-flow.md](mon_app/design/user-flow.md)

## 6. Contenu de chaque écran

### Écran 1 — Accueil / catalogue
- On y voit : le titre « Devisexpress », une barre de recherche, les puces de catégories, la liste des prestations en cartes (nom, catégorie, prix / unité), le bandeau « Devis en cours » en bas.
- On peut y faire : démarrer un nouveau devis (choisir le client), chercher, filtrer, ouvrir une prestation.
- Bouton principal : « Nouveau devis » (puis « Voir le devis » dans le bandeau).

### Écran 2 — Vue filtrée
- On y voit : la puce active (ex. « Façade »), le nombre de résultats (« 4 prestations »), les cartes correspondantes, un lien « Effacer le filtre ».
- On peut y faire : changer ou retirer le filtre, affiner par mot-clé, ouvrir une prestation.
- Bouton principal : la carte de la prestation (zone tactile entière).

### Écran 3 — Fiche prestation
- On y voit : le nom, la description, le prix unitaire et l'unité, un sélecteur de quantité (− / champ / +), le total de la ligne calculé en direct.
- On peut y faire : régler la quantité, ajouter une remarque, revenir au catalogue.
- Bouton principal : « Ajouter au devis » (fixé en bas, pleine largeur).

### Écran 4 — Récapitulatif du devis
- On y voit : le client, les lignes (prestation, quantité, total), le total HT, la TVA 8,1 %, le total TTC.
- On peut y faire : modifier une quantité, supprimer une ligne, changer de client.
- Bouton principal : « Générer le PDF ».

## 7. Ambiance visuelle

Fiable, directe, chaleureuse. Comme **le carnet de chantier bien tenu d'un bon artisan** : clair, robuste, sans fioritures, avec une touche humaine.

## 8. Palette

Direction retenue après la critique ([design/critique.md](mon_app/design/critique.md)) :

- Fond : blanc cassé chaud (#F7F6F2)
- Texte : quasi-noir (#16181D)
- Accent : orange chantier foncé (#B23F0A) pour les boutons d'action
- Attention / erreur : rouge brique (#B3261E)
- Succès / confirmation : vert (#1E6B3A)

## 9. Interdits

- pas de Bootstrap, pas de React, pas de framework ni de librairie JavaScript
- pas de compte obligatoire pour utiliser l'app
- pas de `alert()` pour les erreurs : messages sous les champs
- pas de texte gris clair sur fond clair (contraste < 4,5:1)
- pas de bouton plus petit que 48 × 48 px
