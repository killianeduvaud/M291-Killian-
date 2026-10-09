# Prédictions — e1-8 La caisse du kiosque

Recharger la page (F5) entre chaque scénario.

## Scénario 1 — Un clic sur Frites

- Je pense que l'écran va montrer : Total à « 6 CHF », et « Frites » dans le plateau.
- Ce qui s'est passé : Total affiche **« 06 CHF »** (et pas « 6 CHF »). Plateau : « Frites ».
- Explication (boîte, vitrine, texte entre guillemets) : `"6"` est écrit **entre guillemets**, c'est du texte. La boîte `total` vaut le nombre 0, et `0 + "6"` colle les deux au lieu de les additionner : la boîte contient le texte `"06"`, que la vitrine recopie.

## Scénario 2 — Frites, puis Boisson

- Je pense que l'écran va montrer : Total à « 10 CHF » (6 + 4), et « Frites Boisson » dans le plateau.
- Ce qui s'est passé : Total affiche **« 064 CHF »** au lieu de 10 CHF. Plateau : « Frites Boisson ».
- Explication (boîte, vitrine, texte entre guillemets) : après Frites la boîte contient le texte `"06"`. Boisson fait `"06" + "4"` : on colle encore un texte au bout, donc `"064"`. Aucune addition n'a lieu.

## Scénario 3 — Frites, puis code PALEO, puis Appliquer

- Je pense que l'écran va montrer : Total revient à « 0 CHF » et le plateau se vide, comme le dit l'affiche.
- Ce qui s'est passé : rien ne change, Total reste à **« 06 CHF »**. Le total ne revient pas à 0.
- Explication (boîte, vitrine, texte entre guillemets) : le script compare le code avec `"paleo"` en minuscules. J'ai tapé `PALEO` en majuscules comme sur l'affiche. Pour JavaScript, `"PALEO"` et `"paleo"` sont deux textes différents, donc la condition est fausse et la boîte n'est jamais remise à 0.

## Scénario 4 — Frites, puis Vider le plateau, puis Frites

- Je pense que l'écran va montrer : Total à « 6 CHF », car Vider remet tout à zéro avant les deuxièmes Frites.
- Ce qui s'est passé : après « Vider », l'écran montre bien « 0 CHF »… mais au deuxième Frites, Total affiche **« 066 CHF »**.
- Explication (boîte, vitrine, texte entre guillemets) : « Vider » efface seulement la **vitrine** (le texte à l'écran), pas la **boîte** `total`, qui contient toujours `"06"`. Au clic suivant, `"06" + "6"` donne `"066"`, et la vitrine recopie cette vieille boîte.
