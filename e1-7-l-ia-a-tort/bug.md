# Bug du compteur

Ce que je vois : je clique plusieurs fois sur +1, le chiffre à l'écran reste à 0. Pourtant la console affiche « n vaut maintenant 1 », puis 2, puis 3.
Ce que j'attendais : que le chiffre à l'écran monte de 1 à chaque clic (1, 2, 3…).
La boîte qui change : `n` (la variable en mémoire), elle passe bien de 0 à 1, 2, 3.
Ce qui ne se met pas à jour : la vitrine, c'est-à-dire le paragraphe `<p id="affiche">` à l'écran. Personne ne recopie `n` dedans.

## La correction, expliquée comme à un camarade

Dans la fonction du clic, l'IA augmentait bien la boîte `n`, mais elle oubliait de recopier la boîte dans la vitrine. La mémoire et l'écran sont deux mondes séparés : rien n'est automatique. J'ai ajouté une seule ligne, juste après `n = n + 1;` :

```js
document.getElementById("affiche").textContent = n;
```

Elle prend la valeur de `n` et l'écrit dans le paragraphe `affiche`. Maintenant le chiffre à l'écran suit les clics.
