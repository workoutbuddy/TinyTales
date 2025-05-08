import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5e6ff',
      100: '#e6b3ff',
      200: '#d680ff',
      300: '#c64dff',
      400: '#b31aff',
      500: '#9900e6',
      600: '#7a00b3',
      700: '#5c0080',
      800: '#3d004d',
      900: '#1f001a',
    },
  },
  fonts: {
    heading: 'Quicksand, sans-serif',
    body: 'Quicksand, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'xl',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'scale(1.05)',
            transition: 'all 0.2s',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
            transform: 'scale(1.05)',
            transition: 'all 0.2s',
          },
        },
      },
    },
    Container: {
      baseStyle: {
        maxW: 'container.md',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme; 