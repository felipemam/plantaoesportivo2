/**
 * Pure functions for calculating reading progress, content depth,
 * and estimated remaining reading time.
 */

/**
 * Extracts the numerical minutes from strings like "6 min de leitura" or "10 min".
 */
export function parseMinutesFromReadTime(readTimeStr?: string): number {
  if (!readTimeStr) return 5;
  const match = readTimeStr.match(/(\d+)/);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    return isNaN(val) || val <= 0 ? 5 : val;
  }
  return 5;
}

export interface ReadingProgressMetrics {
  percentage: number;
  remainingMinutes: number;
  remainingText: string;
  depthLabel: string;
  isComplete: boolean;
}

/**
 * Calculates scroll percentage through a designated element or document window.
 * Returns an integer between 0 and 100.
 */
export function calculateScrollPercentage(
  scrollY: number,
  elementTop: number,
  elementHeight: number,
  viewportHeight: number
): number {
  if (elementHeight <= 0) return 0;

  // The scrollable range is from the top of the element until the bottom of the element reaches the viewport bottom
  const totalScrollableDistance = elementHeight - (viewportHeight * 0.4);
  if (totalScrollableDistance <= 0) {
    return scrollY >= elementTop ? 100 : 0;
  }

  const currentScrolled = scrollY - elementTop;
  if (currentScrolled <= 0) return 0;

  const ratio = currentScrolled / totalScrollableDistance;
  const clamped = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  return clamped;
}

/**
 * Computes remaining reading time and milestone labels based on progress.
 */
export function computeReadingMetrics(
  progressPct: number,
  totalMinutes: number
): ReadingProgressMetrics {
  const clamped = Math.min(100, Math.max(0, Math.round(progressPct)));
  const isComplete = clamped >= 98;

  if (isComplete) {
    return {
      percentage: 100,
      remainingMinutes: 0,
      remainingText: 'Leitura concluída',
      depthLabel: 'Artigo concluído',
      isComplete: true
    };
  }

  const fractionRemaining = (100 - clamped) / 100;
  const remainingMinutes = Math.max(1, Math.round(totalMinutes * fractionRemaining));
  const remainingText = `~${remainingMinutes} min restante${remainingMinutes > 1 ? 's' : ''}`;

  let depthLabel = 'Início da matéria';
  if (clamped >= 75) {
    depthLabel = 'Conclusão e desfecho';
  } else if (clamped >= 50) {
    depthLabel = 'Mais da metade lido';
  } else if (clamped >= 25) {
    depthLabel = 'Desenvolvimento do texto';
  }

  return {
    percentage: clamped,
    remainingMinutes,
    remainingText,
    depthLabel,
    isComplete: false
  };
}
