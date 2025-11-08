/**
 * Utilitaires pour le partage de contenu
 */

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/**
 * Vérifie si l'API Web Share est disponible
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Partage du contenu via l'API Web Share native
 * Fallback sur la copie du lien dans le presse-papier
 */
export async function shareContent(data: ShareData): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }> {
  // Tenter d'utiliser l'API Web Share native (mobile principalement)
  if (canUseWebShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return { success: true, method: 'native' };
    } catch (error) {
      // L'utilisateur a annulé le partage ou une erreur s'est produite
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'none' };
      }
      // Fallback sur le clipboard
    }
  }

  // Fallback: copier le lien dans le presse-papier
  try {
    await copyToClipboard(data.url);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return { success: false, method: 'none' };
  }
}

/**
 * Copie du texte dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback pour les navigateurs plus anciens
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Génère l'URL de partage pour un café
 */
export function getCoffeeShareUrl(coffeeId: number): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sipzy.coffee';
  return `${baseUrl}/coffees/${coffeeId}`;
}

/**
 * Génère l'URL de partage pour un avis
 */
export function getReviewShareUrl(coffeeId: number, reviewId: number): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sipzy.coffee';
  return `${baseUrl}/coffees/${coffeeId}?review=${reviewId}`;
}

/**
 * Génère l'URL de partage pour un profil utilisateur
 */
export function getProfileShareUrl(username: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sipzy.coffee';
  return `${baseUrl}/profile/${username}`;
}

/**
 * Partage un café
 */
export async function shareCoffee(coffeeName: string, coffeeId: number) {
  return shareContent({
    title: `${coffeeName} - Sipzy`,
    text: `Découvrez ce café sur Sipzy : ${coffeeName}`,
    url: getCoffeeShareUrl(coffeeId),
  });
}

/**
 * Partage un avis
 */
export async function shareReview(coffeeName: string, coffeeId: number, reviewId: number) {
  return shareContent({
    title: `Avis sur ${coffeeName} - Sipzy`,
    text: `Découvrez cet avis sur ${coffeeName}`,
    url: getReviewShareUrl(coffeeId, reviewId),
  });
}

/**
 * Partage un profil utilisateur
 */
export async function shareProfile(username: string) {
  return shareContent({
    title: `Profil de ${username} - Sipzy`,
    text: `Découvrez le profil de ${username} sur Sipzy`,
    url: getProfileShareUrl(username),
  });
}
