export const moodThemes = {
  bedtime: {
    name: 'Bedtime',
    bgGradient: 'linear(to-br, #232946, #5f6caf)',
    accent: '#b8c1ec',
    text: '#f4f4f4',
    cardBg: '#181c2acc',
    button: { bg: '#b8c1ec', color: '#232946' },
    font: 'Quicksand, sans-serif',
    icon: '🛏',
    illustration: '/assets/bg-bedtime.svg',
  },
  silly: {
    name: 'Silly',
    bgGradient: 'linear(to-br, #fff6b7, #f6416c)',
    accent: '#f9c846',
    text: '#232946',
    cardBg: '#fff6b7cc',
    button: { bg: '#f6416c', color: '#fff' },
    font: 'Baloo 2, cursive',
    icon: '🤪',
    illustration: '/assets/bg-silly.svg',
  },
  bold: {
    name: 'Bold',
    bgGradient: 'linear(to-br, #ff512f, #dd2476)',
    accent: '#ffb347',
    text: '#fff',
    cardBg: '#7a1333e6',
    button: { bg: '#dd2476', color: '#fff' },
    font: 'Nunito, sans-serif',
    icon: '🧗',
    illustration: '/assets/bg-bold.svg',
  },
  curious: {
    name: 'Curious',
    bgGradient: 'linear(to-br, #43cea2, #185a9d)',
    accent: '#ffe066',
    text: '#232946',
    cardBg: '#43cea2cc',
    button: { bg: '#185a9d', color: '#fff' },
    font: 'Quicksand, sans-serif',
    icon: '🧠',
    illustration: '/assets/bg-curious.svg',
  },
};
export type MoodKey = keyof typeof moodThemes; 