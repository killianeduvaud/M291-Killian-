# Persona — Devisexpress

**Prénom et âge :** Marc Duvoisin, 38 ans  
**Occupation :** peintre en bâtiment indépendant, seul dans son entreprise depuis 6 ans  
**Où et quand il utilise l'app :** dans sa camionnette, garée devant le chantier, juste après la visite chez le client (souvent entre 17 h et 18 h 30)  
**Appareil :** surtout téléphone (Android d'entrée de gamme, écran ~390 px), parfois l'ordinateur portable le soir à la maison

## Contexte de vie

- Habite à Yverdon-les-Bains, travaille dans le Nord vaudois et la Broye (villas, appartements, petites façades).
- Fait aujourd'hui ses devis à la main dans Word : il recopie à chaque fois son adresse, son IBAN et ses prix. Il lui faut 30 à 45 minutes par devis, souvent le soir.
- Utilise son téléphone d'une main, l'autre tenant le mètre ou le carnet de mesures. Doigts parfois tachés de peinture, gants en hiver.
- À l'aise avec WhatsApp, les e-mails et l'e-banking. Pas avec les logiciels de gestion « complets » qu'il trouve chers et compliqués.

## Objectif (une phrase)

Envoyer un devis propre et juste au client **le jour même de la visite**, en moins de 5 minutes, sans retaper ses coordonnées ni ses prix.

## Phrase typique (ce qu'il dirait vraiment)

« Si je dois créer un compte et remplir dix écrans avant de pouvoir écrire "peinture salon, 45 m²", je reste sur Word. »

## Ce qui le fait fermer l'onglet

- Un compte ou un abonnement obligatoire avant de voir quoi que ce soit.
- Des petits boutons collés qu'il rate avec le pouce.
- Un total qui ne se met pas à jour tout de suite, ou une TVA qu'il doit calculer lui-même.
- Un texte gris clair illisible en plein soleil dans la camionnette.
- Perdre ce qu'il a saisi parce qu'il a reçu un appel.

## Freins majeurs

- **Confiance :** il a peur qu'une erreur de calcul (TVA 8,1 %, total) lui fasse perdre de l'argent ou passe pour du travail d'amateur.
- **Temps :** le soir, il veut finir sa journée, pas faire de l'administratif.
- **Matériel :** forfait mobile limité, réseau faible sur certains chantiers.

## 3 faits utiles pour le design

1. **Mobile d'abord, à une main :** largeur de référence 390 px, boutons d'au moins 48 × 48 px, bouton principal en bas de l'écran, à portée du pouce.
2. **Lisible dehors :** contraste fort (WCAG AA ≥ 4,5:1, viser plus pour le texte important), texte de base ≥ 16 px, montants en gras.
3. **Zéro ressaisie et calcul visible :** les infos de l'entreprise et les prestations sont déjà enregistrées ; chaque ajout met à jour le total (HT, TVA 8,1 %, TTC) instantanément et le devis en cours est conservé si l'app est fermée.

## Règles de conception déduites

1. Aucune inscription : l'app s'ouvre directement sur le catalogue des prestations.
2. Le prix et l'unité (heure, m², forfait) sont écrits en toutes lettres sur chaque carte.
3. Un bandeau « Devis en cours » reste visible en bas de l'écran avec le nombre de lignes et le total.
4. Chaque action donne un retour immédiat (« Ajouté au devis ✓ », total mis à jour).
