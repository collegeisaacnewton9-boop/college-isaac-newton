/**
 * Download Helper Utility for Collège Isaac Newton
 * Enables downloading original school media, photos, and assets directly to the user's local device.
 */
import { toast } from 'sonner';

export async function downloadImageFile(url: string, suggestedFilename: string = 'cin-image.jpg'): Promise<boolean> {
  if (!url) {
    toast.error('Aucune URL d\'image valide à télécharger.');
    return false;
  }

  try {
    // 1. Data URLs (base64)
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Image téléchargée sur votre poste local !', {
        description: suggestedFilename,
      });
      return true;
    }

    // 2. Standard HTTP/HTTPS or relative path
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = suggestedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup memory
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

    toast.success('Image originale téléchargée sur votre poste local !', {
      description: suggestedFilename,
    });
    return true;
  } catch (error) {
    // 3. Fallback: direct anchor trigger or open in tab
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedFilename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.info('Téléchargement lancé via le navigateur.', {
        description: suggestedFilename,
      });
      return true;
    } catch {
      toast.error('Impossible de télécharger directement l\'image. Vous pouvez faire clic droit > "Enregistrer sous".');
      return false;
    }
  }
}
