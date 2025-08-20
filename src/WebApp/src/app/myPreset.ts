import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#e7e8fb',
            100: '#d1d3f9',
            200: '#b3b5f4',
            300: '#9799f0',
            400: '#7c7dee',
            500: '#636AE8', // your desired main color
            600: '#575fce',
            700: '#4a52b3',
            800: '#3b4394',
            900: '#2f3577',
            950: '#1f234f'
        }
    }
});
