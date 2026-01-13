// Shared visual tokens for auth forms (colors/effects only)
export const glassContainer = 'w-full card-glass p-8 max-h-[90vh] overflow-y-auto';
export const glassMorph = 'glass-morph';
export const iconBubble = `absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full ${glassMorph} bg-background/20`;
export const inputBase = `w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl ${glassMorph} bg-background/15 text-green-600 placeholder:text-green-600 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base`;
export const inputBasePassword = `${inputBase} pr-24`;
export const btnPrimary = 'w-full px-8 py-4 rounded-xl btn-gradient text-white font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3';
export const socialButton = `flex-1 max-w-40 h-12 rounded-xl ${glassMorph} bg-background/15 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-(--ui-border) flex items-center justify-center gap-2 font-medium border border-(--ui-border)`;
export const backHomeBtn = `w-10 h-10 flex items-center justify-center rounded-full ${glassMorph} bg-background/20 text-white hover:bg-background/25 shadow-md border border-(--ui-border)`;

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
