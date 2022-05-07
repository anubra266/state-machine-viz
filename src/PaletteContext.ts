import { InterpreterFrom } from 'xstate';
import { paletteMachine } from './paletteMachine';
import { createRequiredContext } from './components/utils';

export const [PaletteProvider, usePalette] = createRequiredContext<
  InterpreterFrom<typeof paletteMachine>
>('Palette');
