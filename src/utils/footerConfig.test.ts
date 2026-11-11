import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOOTER_CONFIG,
  mergeFooterConfig
} from './footerConfig';

test('mergeFooterConfig returns default values when given null or empty object', () => {
  const res = mergeFooterConfig(null);
  assert.equal(res.developerCredit, DEFAULT_FOOTER_CONFIG.developerCredit);
  assert.equal(res.brandBio, DEFAULT_FOOTER_CONFIG.brandBio);
  assert.equal(res.institutionalItems.length, 5);
});

test('mergeFooterConfig overrides custom fields and trims whitespace', () => {
  const res = mergeFooterConfig({
    brandBio: '  Nova descrição do portal esportivo.  ',
    companyInfoText: '  CNPJ 12.345.678/0001-99 • Brasília, DF  ',
    developerCredit: '  FELIPE MARCELO ALECRIM MACIEL  '
  });

  assert.equal(res.brandBio, 'Nova descrição do portal esportivo.');
  assert.equal(res.companyInfoText, 'CNPJ 12.345.678/0001-99 • Brasília, DF');
  assert.equal(res.developerCredit, 'FELIPE MARCELO ALECRIM MACIEL');
  assert.equal(res.copyrightText, DEFAULT_FOOTER_CONFIG.copyrightText);
});

test('mergeFooterConfig preserves default when empty string is passed', () => {
  const res = mergeFooterConfig({
    brandBio: '   ',
    copyrightText: ''
  });

  assert.equal(res.brandBio, DEFAULT_FOOTER_CONFIG.brandBio);
  assert.equal(res.copyrightText, DEFAULT_FOOTER_CONFIG.copyrightText);
});
