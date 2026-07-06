const componentOverrides = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: theme.palette.background.default,
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.divider,
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
      '*::-webkit-scrollbar-corner': {
        background: theme.palette.background.default,
      },
    }),
  },

  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
      fullWidth: true,
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '8px',
        transition: 'all 0.2s ease',

        backgroundColor: theme.palette.grey[50],

        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.customInput?.hoverBorder || theme.palette.text.secondary,
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        },

        '&.Mui-disabled': {
          backgroundColor: theme.palette.background.muted,
          cursor: 'not-allowed',
        },
      }),

      notchedOutline: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),

      input: ({ theme }) => ({
        color: theme.palette.text.primary,
        fontSize: '14px',
        '&.Mui-disabled': {
          color: theme.palette.text.secondary,
          WebkitTextFillColor: theme.palette.text.secondary,
        },
      }),
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: '14px',
        color: theme.palette.text.secondary,
      }),
    },
  },
};

export default componentOverrides;
