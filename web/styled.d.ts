import 'styled-components';
import { type Theme } from '@themes/themes';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
