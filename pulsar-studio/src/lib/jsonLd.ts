/**
 * JSON-LD scris într-un `<script>` inline.
 *
 * `JSON.stringify` singur nu e de ajuns: dacă un text ajunge vreodată să
 * conțină `</script>`, browserul închide eticheta acolo și restul marcajului
 * se revarsă în pagină. Textele de aici sunt scrise de noi, deci riscul e
 * teoretic — dar escaparea costă o linie și rămâne corectă și atunci când
 * cineva lipește altceva în constante peste un an.
 */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
