# Pitch — mon app M291

**Nom de l’app :** Devisexpress

**En une phrase, elle sert à :** Créer un devis propre en PDF en moins d’une minute, à partir des infos de son entreprise déjà enregistrées.

**À qui (prénom + âge + situation) :** Marc, 38 ans, peintre indépendant à Yverdon, qui fait ses devis à la main dans Word et perd du temps à tout recopier à chaque fois.

**La tâche n°1 (celle du flow) :** L'utilisateur arrive sur l'application, clique sur « Créer un devis » et remplit les champs avec ses informations. Il clique ensuite sur « Générer » et obtient un devis en PDF avec les informations qu'il a remplies.

**Les données (inventées) ressemblent à :** fiches de prestations (nom, description, prix unitaire, unité : heure / m² / forfait) + fiches clients (nom, adresse, e-mail) + une fiche entreprise (nom, logo, adresse, n° TVA).

**Pourquoi ce n’est pas trop grand pour 4 semaines de code :** Une seule tâche principale (créer un devis). Pas de compte utilisateur ni de serveur : les infos de l’entreprise sont enregistrées dans le navigateur, et les prestations et les clients sont des données inventées dans un fichier JSON. Le PDF est créé avec la fonction d’impression du navigateur. L’export Word, l’envoi par e-mail et l’historique des devis sont des bonus, seulement s’il reste du temps.
