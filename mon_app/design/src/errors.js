// Error catalogue: every failure shown to the user has a code, a name and a
// plain-language explanation with a suggestion of what to do.
const CATALOG = {
  PROFILE_NOT_FOUND: {
    code: 'DEV-101',
    title: 'Profil introuvable',
    message: 'Le profil d\'entreprise sélectionné n\'existe plus ou ses données sont abîmées.',
    hint: 'Choisissez un autre profil, ou recréez-le dans « Profils d\'entreprise ».',
  },
  PROFILE_SAVE_FAILED: {
    code: 'DEV-102',
    title: 'Impossible d\'enregistrer le profil',
    message: 'Le profil n\'a pas pu être écrit sur le disque.',
    hint: 'Vérifiez qu\'il reste de la place sur le disque, puis réessayez.',
  },
  PROFILE_DELETE_FAILED: {
    code: 'DEV-103',
    title: 'Impossible de supprimer le profil',
    message: 'Le profil n\'a pas pu être supprimé du disque.',
    hint: 'Fermez puis rouvrez l\'application, et réessayez.',
  },
  PROFILE_LIST_FAILED: {
    code: 'DEV-104',
    title: 'Impossible de lire les profils',
    message: 'La liste des profils d\'entreprise n\'a pas pu être chargée.',
    hint: 'Fermez puis rouvrez l\'application.',
  },
  LOGO_UNREADABLE: {
    code: 'DEV-110',
    title: 'Logo illisible',
    message: 'L\'image choisie comme logo n\'a pas pu être lue.',
    hint: 'Utilisez une image PNG ou JPG valide, puis enregistrez à nouveau le profil.',
  },
  TEMPLATE_MISSING: {
    code: 'DEV-201',
    title: 'Modèle de devis introuvable',
    message: 'Le fichier du modèle choisi est absent de l\'application.',
    hint: 'Choisissez un autre modèle ou réinstallez l\'application.',
  },
  WORD_GENERATION_FAILED: {
    code: 'DEV-202',
    title: 'Le document Word n\'a pas pu être créé',
    message: 'Une erreur est survenue en remplissant le modèle Word.',
    hint: 'Essayez le format PDF ou un autre modèle.',
  },
  PDF_GENERATION_FAILED: {
    code: 'DEV-203',
    title: 'Le PDF n\'a pas pu être créé',
    message: 'Une erreur est survenue pendant la création du PDF.',
    hint: 'Essayez le format Word, ou utilisez un logo plus léger.',
  },
  PREVIEW_FAILED: {
    code: 'DEV-204',
    title: 'Aperçu indisponible',
    message: 'L\'aperçu de ce modèle n\'a pas pu être affiché.',
    hint: 'Vous pouvez quand même choisir le modèle et créer le devis.',
  },
  FILE_IN_USE: {
    code: 'DEV-301',
    title: 'Fichier déjà ouvert',
    message: 'Le fichier est utilisé par une autre application.',
    hint: 'Fermez-le (par exemple dans Word ou Aperçu) puis réessayez, ou choisissez un autre nom.',
  },
  FILE_ACCESS_DENIED: {
    code: 'DEV-302',
    title: 'Accès refusé',
    message: 'L\'application n\'a pas le droit d\'écrire à cet emplacement.',
    hint: 'Enregistrez le devis ailleurs, par exemple dans Documents ou sur le Bureau.',
  },
  DISK_FULL: {
    code: 'DEV-303',
    title: 'Disque plein',
    message: 'Il n\'y a plus assez de place sur le disque pour enregistrer le fichier.',
    hint: 'Libérez de l\'espace ou enregistrez sur un autre disque.',
  },
  FILE_WRITE_FAILED: {
    code: 'DEV-304',
    title: 'Impossible d\'enregistrer le fichier',
    message: 'Le devis a été créé mais n\'a pas pu être écrit à l\'emplacement choisi.',
    hint: 'Choisissez un autre dossier ou un autre nom de fichier.',
  },
  NUMBERING_FAILED: {
    code: 'DEV-401',
    title: 'Numérotation non mise à jour',
    message: 'Le devis a bien été enregistré, mais le compteur des numéros n\'a pas pu être mis à jour.',
    hint: 'Vérifiez le numéro proposé pour le prochain devis.',
  },
  UNEXPECTED: {
    code: 'DEV-900',
    title: 'Erreur inattendue',
    message: 'Une erreur imprévue s\'est produite.',
    hint: 'Réessayez. Si le problème continue, notez le code et les détails techniques.',
  },
};

class AppError extends Error {
  constructor(name, cause) {
    super((CATALOG[name] || CATALOG.UNEXPECTED).message);
    this.name = CATALOG[name] ? name : 'UNEXPECTED';
    this.cause = cause;
  }
}

// Maps Node file-system error codes to catalogue entries.
function fileErrorKey(err) {
  switch (err && err.code) {
    case 'EBUSY':
    case 'ETXTBSY':
      return 'FILE_IN_USE';
    case 'EACCES':
    case 'EPERM':
    case 'EROFS':
      return 'FILE_ACCESS_DENIED';
    case 'ENOSPC':
      return 'DISK_FULL';
    default:
      return null;
  }
}

// Technical details, shortened and without embedded images (data URLs).
function technicalDetails(err) {
  if (!err) return '';
  const text = String(err.message || err).replace(/data:[^\s'"]{80,}/g, 'data:…');
  return text.length > 600 ? `${text.slice(0, 600)}…` : text;
}

// Plain object sent to the renderer through IPC.
function toPayload(err, fallbackName = 'UNEXPECTED') {
  const name = err instanceof AppError ? err.name : (fileErrorKey(err) || fallbackName);
  const entry = CATALOG[name] || CATALOG.UNEXPECTED;
  const cause = err instanceof AppError ? err.cause : err;
  return { code: entry.code, name, title: entry.title, message: entry.message, hint: entry.hint, details: technicalDetails(cause) };
}

module.exports = { AppError, fileErrorKey, toPayload };
