/*
 * Mărcile de plată, desenate ca SVG monocrom în locul logo-urilor oficiale
 * colorate. Sunt afișate ca informație — „astea se acceptă" — nu ca active
 * de brand: monocrome, la aceeași dimensiune, fără să imite identitatea
 * niciunui procesator. Nu se încarcă nimic de pe servere externe.
 */

const shared = "h-6 w-auto shrink-0";

export function VisaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className ?? shared} role="img" aria-label="Visa" fill="currentColor">
      <title>Visa</title>
      <text
        x="24"
        y="17"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className ?? shared} role="img" aria-label="Mastercard" fill="none">
      <title>Mastercard</title>
      <circle cx="19" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="29" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PayPalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className ?? shared} role="img" aria-label="PayPal" fill="currentColor">
      <title>PayPal</title>
      <text x="24" y="17" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="12" fontWeight="700">
        PayPal
      </text>
    </svg>
  );
}

export function BankTransferMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className ?? shared} role="img" aria-label="Transfer bancar" fill="none">
      <title>Transfer bancar</title>
      {/* Frontonul clasic de bancă: acoperiș, coloane, soclu. */}
      <path d="M24 4.5 33.5 9.5H14.5L24 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 11.5v5M21.7 11.5v5M26.3 11.5v5M31 11.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 19h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CryptoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className ?? shared} role="img" aria-label="Criptomonede" fill="none">
      <title>Criptomonede</title>
      <circle cx="24" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M21.6 7.6v8.8M23.6 6.6v1.2M23.6 16.2v1.2M21.6 8.6h3.1a1.9 1.9 0 0 1 0 3.8h-3.1M21.6 12.4h3.5a2 2 0 0 1 0 4h-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const paymentMarks = {
  visa: VisaMark,
  mastercard: MastercardMark,
  transfer: BankTransferMark,
  paypal: PayPalMark,
  crypto: CryptoMark,
} as const;
