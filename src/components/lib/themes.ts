export type ThemeName =
  | 'theme-violet'
  | 'theme-orange'
  | 'theme-green'
  | 'theme-olive'
  | 'theme-blue'
  | 'theme-heaven'
  | 'theme-dark'
  | 'theme-purple';

export interface Theme {
  name: ThemeName;
  preview: string;
  background: string;
}

export const themes: Theme[] = [
  {
    name: 'theme-orange',
    preview: 'preview-theme-orange',
    background: 'bg-start-orange',
  },
  {
    name: 'theme-green',
    preview: 'preview-theme-green',
    background: 'bg-start-green',
  },
  {
    name: 'theme-olive',
    preview: 'preview-theme-olive',
    background: 'bg-start-olive',
  },
  {
    name: 'theme-blue',
    preview: 'preview-theme-blue',
    background: 'bg-start-blue',
  },
  {
    name: 'theme-violet',
    preview: 'preview-theme-violet',
    background: 'bg-start-violet',
  },
  {
    name: 'theme-purple',
    preview: 'preview-theme-purple',
    background: 'bg-start-purple',
  },
  {
    name: 'theme-heaven',
    preview: 'preview-theme-heaven',
    background: 'bg-start-heaven',
  },
  {
    name: 'theme-dark',
    preview: 'preview-theme-dark',
    background: 'bg-start-dark',
  },
];

export function getThemeBackground(themeName: ThemeName): string {
  const theme = themes.find((t) => t.name === themeName);
  return theme?.background || 'bg-start-violet';
}
