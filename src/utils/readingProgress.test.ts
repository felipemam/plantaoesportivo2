import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMinutesFromReadTime,
  calculateScrollPercentage,
  computeReadingMetrics
} from './readingProgress';

test('parseMinutesFromReadTime correctly extracts numbers from strings', () => {
  assert.equal(parseMinutesFromReadTime('6 min de leitura'), 6);
  assert.equal(parseMinutesFromReadTime('12 min'), 12);
  assert.equal(parseMinutesFromReadTime('1 min de leitura'), 1);
  assert.equal(parseMinutesFromReadTime(''), 5);
  assert.equal(parseMinutesFromReadTime('Sem tempo definido'), 5);
});

test('calculateScrollPercentage calculates clamped scroll values between 0 and 100', () => {
  const elementTop = 200;
  const elementHeight = 2000;
  const viewportHeight = 800;

  // Before reaching the element
  assert.equal(calculateScrollPercentage(100, elementTop, elementHeight, viewportHeight), 0);

  // At the start of the element
  assert.equal(calculateScrollPercentage(200, elementTop, elementHeight, viewportHeight), 0);

  // Mid-way through reading
  const midScroll = 200 + (2000 - 320) / 2; // (scrollY - 200) / 1680 = 0.5
  assert.equal(calculateScrollPercentage(midScroll, elementTop, elementHeight, viewportHeight), 50);

  // Deep scroll / past element bottom
  assert.equal(calculateScrollPercentage(3000, elementTop, elementHeight, viewportHeight), 100);

  // Edge case: zero or negative height
  assert.equal(calculateScrollPercentage(500, 0, 0, 800), 0);
});

test('computeReadingMetrics generates accurate time and content depth milestones', () => {
  // Start (0%)
  const start = computeReadingMetrics(0, 6);
  assert.equal(start.percentage, 0);
  assert.equal(start.remainingMinutes, 6);
  assert.equal(start.remainingText, '~6 min restantes');
  assert.equal(start.depthLabel, 'Início da matéria');
  assert.equal(start.isComplete, false);

  // Quarter (30%)
  const quarter = computeReadingMetrics(30, 6);
  assert.equal(quarter.percentage, 30);
  assert.equal(quarter.remainingMinutes, 4);
  assert.equal(quarter.depthLabel, 'Desenvolvimento do texto');
  assert.equal(quarter.isComplete, false);

  // Half (55%)
  const half = computeReadingMetrics(55, 6);
  assert.equal(half.percentage, 55);
  assert.equal(half.remainingMinutes, 3);
  assert.equal(half.depthLabel, 'Mais da metade lido');
  assert.equal(half.isComplete, false);

  // Conclusion (80%)
  const conclusion = computeReadingMetrics(80, 6);
  assert.equal(conclusion.percentage, 80);
  assert.equal(conclusion.remainingMinutes, 1);
  assert.equal(conclusion.remainingText, '~1 min restante');
  assert.equal(conclusion.depthLabel, 'Conclusão e desfecho');
  assert.equal(conclusion.isComplete, false);

  // Complete (99%)
  const complete = computeReadingMetrics(99, 6);
  assert.equal(complete.percentage, 100);
  assert.equal(complete.remainingMinutes, 0);
  assert.equal(complete.remainingText, 'Leitura concluída');
  assert.equal(complete.depthLabel, 'Artigo concluído');
  assert.equal(complete.isComplete, true);
});
