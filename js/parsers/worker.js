/* OmicsLab Parser Web Worker — spawned by js/data-import.js */

importScripts('fastq-parser.js', 'vcf-parser.js', 'matrix-parser.js');

self.onmessage = function (e) {
  const { id, type, text, buffer } = e.data;
  try {
    const str = text != null ? text
      : (buffer ? new TextDecoder().decode(new Uint8Array(buffer)) : '');
    let result;
    if      (type === 'fastq')  result = parseFastqText(str);
    else if (type === 'vcf')    result = parseVcfText(str);
    else if (type === 'matrix') result = parseMatrixText(str);
    else throw new Error('Unknown parser type: ' + type);
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err.message });
  }
};
