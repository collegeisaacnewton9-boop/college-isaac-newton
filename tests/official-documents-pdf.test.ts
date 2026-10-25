import test from 'node:test';
import assert from 'node:assert/strict';
import { officialDocumentsPdfService } from '../src/services/officialDocumentsPdfService';
import { INITIAL_DOCUMENTS } from '../src/data/mockData';

test('Official Documents PDF Generator Service', async (t) => {
  await t.test('should export officialDocumentsPdfService cleanly', () => {
    assert.ok(officialDocumentsPdfService, 'officialDocumentsPdfService should be defined');
    assert.strictEqual(typeof officialDocumentsPdfService.generateDocumentPdf, 'function');
    assert.strictEqual(typeof officialDocumentsPdfService.downloadDocumentPdf, 'function');
  });

  await t.test('should generate ISO 32000-1 compliant PDF for Règlement Intérieur', async () => {
    const reglementDoc = INITIAL_DOCUMENTS.find(d => d.category === 'reglement') || INITIAL_DOCUMENTS[0];
    const result = await officialDocumentsPdfService.generateDocumentPdf(reglementDoc, []);
    
    assert.ok(result.pdfBytes instanceof Uint8Array, 'result.pdfBytes should be Uint8Array');
    assert.ok(result.pdfBytes.length > 1000, 'PDF size should be substantial');
    assert.ok(result.pageCount >= 2, 'Règlement Intérieur should be multi-page');
    assert.ok(result.filename.includes('Reglement-Interieur'), 'Filename should be properly formatted');
    assert.strictEqual(typeof result.downloadBlob, 'function');
  });

  await t.test('should generate official PDF for Academic Calendar with official MENFP periods', async () => {
    const calendarDoc = INITIAL_DOCUMENTS.find(d => d.category === 'calendrier') || INITIAL_DOCUMENTS[1];
    const result = await officialDocumentsPdfService.generateDocumentPdf(calendarDoc, []);
    
    assert.ok(result.pdfBytes.length > 1000);
    assert.ok(result.pageCount >= 1);
    assert.ok(result.filename.includes('Calendrier'));
  });

  await t.test('should generate official PDF for supplies list (Cycle Fondamental)', async () => {
    const suppliesDoc = INITIAL_DOCUMENTS.find(d => d.title.includes('Fondamental')) || INITIAL_DOCUMENTS[2];
    const result = await officialDocumentsPdfService.generateDocumentPdf(suppliesDoc, []);
    
    assert.ok(result.pdfBytes.length > 1000);
    assert.ok(result.pageCount >= 2);
    assert.ok(result.filename.includes('Fournitures-Fondamental'));
  });

  await t.test('should generate official PDF for supplies list (Secondaire NS1-NS4)', async () => {
    const suppliesSecDoc = INITIAL_DOCUMENTS.find(d => d.title.includes('Secondaire')) || INITIAL_DOCUMENTS[3];
    const result = await officialDocumentsPdfService.generateDocumentPdf(suppliesSecDoc, []);
    
    assert.ok(result.pdfBytes.length > 1000);
    assert.ok(result.pageCount >= 2);
    assert.ok(result.filename.includes('Fournitures-Secondaire'));
  });

  await t.test('should generate official PDF for Fiche Médicale et d\'Urgence', async () => {
    const medicalDoc = INITIAL_DOCUMENTS.find(d => d.category === 'formulaires') || INITIAL_DOCUMENTS[4];
    const result = await officialDocumentsPdfService.generateDocumentPdf(medicalDoc, []);
    
    assert.ok(result.pdfBytes.length > 1000);
    assert.ok(result.pageCount >= 2);
    assert.ok(result.filename.includes('Fiche-Medicale'));
  });
});
