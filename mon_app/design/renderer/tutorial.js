// ---------------------------------------------------------------------------
// First-run tutorial: a few animated steps explaining how the app works.
// Scenes are <template> elements in index.html; each one is cloned into the
// stage when its step is shown, so its CSS animations restart every time.
// ---------------------------------------------------------------------------
const Tutorial = (() => {
  const STORAGE_KEY = 'devis.tutorialDone';

  const STEPS = [
    {
      scene: 'scene-welcome',
      title: 'Bienvenue dans Devis',
      text: 'Créez des devis professionnels en quelques minutes, au format PDF ou Word. Voici comment ça marche.',
    },
    {
      scene: 'scene-profile',
      title: 'Créez votre profil d\'entreprise',
      text: 'Dans « Profils d\'entreprise », renseignez une seule fois vos coordonnées, votre logo, votre IBAN et votre devise. Ils sont repris sur chaque devis.',
    },
    {
      scene: 'scene-template',
      title: 'Choisissez un modèle',
      text: 'Cliquez sur « Nouveau devis » : un aperçu de chaque modèle (Classique, Lettre, Travaux) s\'affiche. Choisissez-en un pour ouvrir les champs à remplir.',
    },
    {
      scene: 'scene-fill',
      title: 'Remplissez le devis',
      text: 'Indiquez le client puis vos produits et services, regroupés en sections si besoin. Les champs marqués d\'un * sont obligatoires : l\'application vous signale ceux qui manquent.',
    },
    {
      scene: 'scene-export',
      title: 'Générez et enregistrez',
      text: 'Choisissez PDF ou Word puis « Générer le devis ». Et maintenant, une visite guidée vous montre chaque bouton directement dans l\'application.',
    },
  ];

  let index = 0;
  const el = (id) => document.getElementById(id);

  function isDone() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function markDone() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage unavailable: the tutorial will simply show again next time.
    }
  }

  function render() {
    const step = STEPS[index];
    el('tuto-stage').replaceChildren(el(step.scene).content.cloneNode(true));
    el('tuto-step').textContent = `Étape ${index + 1} sur ${STEPS.length}`;
    el('tuto-title').textContent = step.title;
    el('tuto-text').textContent = step.text;
    el('tuto-dots').innerHTML = STEPS.map((_, i) => `<span class="${i === index ? 'active' : ''}"></span>`).join('');
    el('tuto-prev').classList.toggle('hidden', index === 0);
    el('tuto-next').textContent = index === STEPS.length - 1 ? 'Lancer la visite guidée' : 'Suivant';
  }

  function open() {
    index = 0;
    render();
    el('app').inert = true;
    el('tutorial').classList.remove('hidden');
    el('tuto-next').focus();
  }

  function close() {
    el('tutorial').classList.add('hidden');
    el('tuto-stage').replaceChildren();
    el('app').inert = false;
    markDone();
  }

  function go(delta) {
    const next = index + delta;
    if (next < 0) return;
    if (next >= STEPS.length) {
      // End of the intro: continue with the guided tour of the real screens.
      close();
      Tour.start();
      return;
    }
    index = next;
    render();
    el('tuto-next').focus();
  }

  el('tuto-next').addEventListener('click', () => go(1));
  el('tuto-prev').addEventListener('click', () => go(-1));
  el('tuto-skip').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (el('tutorial').classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  return { open, isDone };
})();
