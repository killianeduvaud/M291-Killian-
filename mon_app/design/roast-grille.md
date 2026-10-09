# Grille de roast — e2-1

Nom : Killian
Date : 18.09.2026

Barème : 1 = cassé · 3 = moyen · 5 = ça va (ces pages n'auront jamais 5 partout).

| Capture | Lisibilité | Navigation | Feedback | Cohérence | Accessibilité | Phrase précise |
|---|---|---|---|---|---|---|
| 01 mur de texte | 1 | 2 | 3 | 3 | 2 | Le titre, les sous-titres, les liens et le texte ont tous la même taille (11 px) et le même poids : rien ne dit par où commencer. Le texte gris #888 sur blanc n'atteint que 3,54:1 (sous les 4,5:1 du WCAG AA). |
| 02 labyrinthe | 3 | 1 | 2 | 2 | 2 | Pour continuer, il faut passer par 6 niveaux (« Menu > Espace > Plus > Options > Avancé > Liste ») et la page avoue elle-même que « le bouton principal est quelque part ». Le lien « Aide? » flotte seul en haut à droite, loin du contenu. |
| 03 silence | 2 | 3 | 1 | 2 | 1 | Le bouton « ok » a un texte #ddd sur un fond #ddd (contraste 1:1, il est invisible) et le clic ne déclenche rien : aucun message, aucun chargement. Les champs n'ont pas de vrai `<label>` et la mention légale #ccc en 11 px n'atteint que 1,61:1. |
| 04 carnaval | 1 | 3 | 3 | 1 | 1 | Cinq polices différentes (Comic Sans, Impact, Georgia, Courier) sur une seule page, et le texte vert #0F0 sur fond jaune #FF0 n'atteint que 1,28:1. Les prix en promo ne sont signalés que par la couleur rouge, « rien d'autre ne le dit ». |

## La pire, pour la présentation

Capture n° 03 parce que le bouton « ok » est invisible (texte #ddd sur fond #ddd, 1:1) et que le clic ne donne aucun retour : l'utilisateur ne peut tout simplement pas créer son compte, et il ne sait même pas pourquoi.

## Une correction mesurable par capture

- **01 mur de texte :** le titre passe à 28 px en gras, les sous-titres à 20 px, le texte à 16 px en #333 (12,6:1), avec 1,5 d'interligne et 16 px d'espace entre les paragraphes.
- **02 labyrinthe :** un seul bouton principal « Voir la liste » de 48 px de haut placé juste sous « Bienvenue » ; la liste est atteinte en 1 clic au lieu de 6.
- **03 silence :** le bouton devient « Créer mon compte » en blanc sur bleu #1D4ED8 (6,7:1) et, au clic, il affiche « Compte créé ✓ » pendant 2 secondes (ou un message rouge sous le champ si l'e-mail est vide).
- **04 carnaval :** une seule police pour le texte et une pour les titres ; texte #1C1917 sur fond blanc (17,5:1) ; les prix en promo portent l'étiquette « Promo -20 % » en plus de la couleur.
