import { ThemeVars } from '@mysten/dapp-kit';

/**
 * Retro White Theme for dApp Kit Wallet Components
 * Based on lightTheme but customized to match RetroButton styling
 */
export const retroWhiteTheme: ThemeVars = {
  blurs: {
    modalOverlay: 'blur(0)',
  },
  backgroundColors: {
    // Primary button - match Sidebar 選中項目的淺灰色
    primaryButton: '#f3f4f6', // Connect Wallet Button Background (淺灰，與 Sidebar 選中一致)
    primaryButtonHover: '#e5e7eb', // Connect Wallet Button Hover Background (更深淺灰)
    outlineButtonHover: '#f3f4f6', // Outline button hover (淺灰)
    modalOverlay: 'rgba(0, 0, 0, 0.3)', // Modal 遮罩 (半透明黑)
    modalPrimary: '#ffffff', // Modal Right Side Background (白色)
    modalSecondary: '#f9fafb', // Modal Left Side Background (淺灰)
    iconButton: 'transparent', // Modal Close Button Background (透明)
    iconButtonHover: '#f3f4f6', // Modal Close Button Hover Background (淺灰)
    dropdownMenu: '#ffffff', // Dropdown Menu Background (白色)
    dropdownMenuSeparator: '#e5e7eb', // Dropdown Menu Separator (淺灰線)
    walletItemSelected: '#f3f4f6', // Selected wallet item (淺灰)
    walletItemHover: '#f9fafb', // Focusing on a wallet item (更淺灰)
  },
  borderColors: {
    outlineButton: '#d1d5db', // Outline button border (中灰)
  },
  colors: {
    // Text colors - match Sidebar 選中項目的深灰色文字
    primaryButton: '#1f2937', // Connect Wallet Button Text (深灰，與 Sidebar 選中一致)
    outlineButton: '#374151', // Outline button text (深灰)
    iconButton: '#374151', // Modal Close Button X Color (深灰)
    body: '#1f2937', // Body text in modals (深灰)
    bodyMuted: '#6b7280', // Secondary text (中灰)
    bodyDanger: '#dc2626', // Error/danger text (紅色保留以顯示錯誤)
  },
  radii: {
    small: '0px',
    medium: '0px',
    large: '0px',
    xlarge: '0px',
  },
  shadows: {
    // Sidebar 選中項目的內凹效果
    primaryButton: 'inset 1px 1px 2px rgba(0, 0, 0, 0.05)',
    walletItemSelected: '0px 2px 6px rgba(0, 0, 0, 0.05)',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600',
  },
  fontSizes: {
    small: '11px',
    medium: '12px',  // Match RetroButton text-xs (12px)
    large: '14px',
    xlarge: '16px',
  },
  typography: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: '0.5px',
  },
};

