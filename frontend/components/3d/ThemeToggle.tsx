"use client";

import { StageTheme } from '@/types/theme';
import { RetroButton } from '@/components/common/RetroButton';

interface ThemeToggleProps {
  currentTheme: StageTheme;
  onThemeChange: (theme: StageTheme) => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="flex gap-1">
      <RetroButton
        onClick={() => onThemeChange('light')}
        variant={currentTheme === 'light' ? 'primary' : 'secondary'}
        size="sm"
        title="Switch to daylight theme"
      >
        ☀️
      </RetroButton>
      <RetroButton
        onClick={() => onThemeChange('dark')}
        variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
        size="sm"
        title="Switch to night theme"
      >
        🌙
      </RetroButton>
    </div>
  );
}

