export type AppTheme = {
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
  };
};

export const lightTheme: AppTheme = {
  colors: {
    background: '#FFF3F1',
    surface: '#FFFFFF',
    textPrimary: '#2A1211',
    textSecondary: '#76504D',
    primary: '#B71C1C',
    success: '#7A1515',
    warning: '#9A2A22',
    danger: '#8F1212',
    border: '#F0C9C4',
  },
};

export const darkTheme: AppTheme = {
  colors: {
    background: '#0B0B0B',
    surface: '#121212',
    textPrimary: '#FFFFFF',
    textSecondary: '#BDBDBD',
    primary: '#FFFFFF',
    success: '#D9D9D9',
    warning: '#9E9E9E',
    danger: '#FFFFFF',
    border: '#2C2C2C',
  },
};
