// Cuemath official brand colors extracted from cuemath.com
export const T = {
  // Primary brand
  green:       "#00B67A",
  greenHover:  "#009965",
  greenLight:  "#E8FAF4",
  greenBorder: "#B8EDD8",
  greenText:   "#007A52",

  // Neutrals (matching their clean white/cream aesthetic)
  white:    "#FFFFFF",
  bg:       "#F7F7F5",   // their off-white page background
  bgCard:   "#FFFFFF",
  bgLight:  "#FAFAFA",

  // Text hierarchy
  heading:  "#1A1A1A",
  body:     "#2B2B2B",
  muted:    "#666666",
  subtle:   "#999999",
  placeholder: "#BDBDBD",

  // Borders
  border:      "#E8E8E8",
  borderHover: "#D0D0D0",

  // Semantic
  red:       "#E53E3E",
  redLight:  "#FFF5F5",
  redBorder: "#FEB2B2",
  amber:     "#D97706",
  amberLight:"#FFFBEB",
  amberBorder:"#FDE68A",
  purple:    "#6366F1",
  purpleLight:"#EEF2FF",

  // Shadows
  shadow:    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  shadowMd:  "0 4px 24px rgba(0,0,0,0.08)",
  shadowLg:  "0 8px 40px rgba(0,0,0,0.10)",

  // Radius
  r:   "10px",
  rMd: "14px",
  rLg: "18px",
  rXl: "24px",
};

export const recStyle = (rec) => ({
  "Strong Yes": { bg: T.greenLight,   border: T.green,  text: T.greenText, label: "Strong Yes", dot: T.green },
  "Yes":        { bg: T.purpleLight,  border: T.purple, text: "#4338CA",   label: "Yes",        dot: T.purple },
  "Maybe":      { bg: T.amberLight,   border: T.amber,  text: T.amber,     label: "Maybe",      dot: T.amber },
  "No":         { bg: T.redLight,     border: T.red,    text: T.red,       label: "No",         dot: T.red },
})[rec] || { bg: T.purpleLight, border: T.purple, text: "#4338CA", label: rec, dot: T.purple };

export const scoreColor = (s) =>
  s >= 8 ? T.green : s >= 6 ? T.purple : s >= 4 ? T.amber : T.red;
export const scoreBg = (s) =>
  s >= 8 ? T.greenLight : s >= 6 ? T.purpleLight : s >= 4 ? T.amberLight : T.redLight;
