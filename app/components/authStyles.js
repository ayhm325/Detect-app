// Shared visual tokens for auth forms
export const glassContainer =
  "w-full card-glass p-6 sm:p-10 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl bg-white/10";
export const glassMorph = "glass-morph backdrop-blur-md";
// Icon bubble on the left (lock/user/etc). Inputs reserve left padding.
export const iconBubble = `absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 shadow-inner text-emerald-500 transition-colors`;
// Default input: reserve left padding for the icon, and right padding for optional buttons
export const inputBase = `w-full pr-12 pl-12 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-emerald-900 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-500 focus:bg-white/30 transition-all text-base font-medium shadow-inner`;
// Password inputs need extra right padding for the show/hide button
export const inputBasePassword = `${inputBase} pr-12`; // Adjust padding for eye icon on the right
export const btnPrimary =
  "w-full px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg transition-all hover:shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3";
export const socialButton = `flex-1 max-w-40 h-12 rounded-xl bg-white border border-white/20 text-emerald-700 shadow-md transition-all hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-center gap-2 font-medium`;
export const backHomeBtn = `w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-emerald-600 hover:bg-white/30 shadow-md border border-white/10 transition-all`;

// Centralized color tokens for auth forms
export const authText = "text-emerald-800"; // primary text color for labels/headings
export const authIcon = "text-emerald-600"; // color for icons and small accents

const authStyles = {
  glassContainer,
  glassMorph,
  iconBubble,
  inputBase,
  inputBasePassword,
  btnPrimary,
  socialButton,
  backHomeBtn,
};

export default authStyles;
