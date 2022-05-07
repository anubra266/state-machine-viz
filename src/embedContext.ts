import { EmbedContext } from './components/types';
import { createRequiredContext } from './components/utils';

export const [EmbedProvider, useEmbed] = createRequiredContext<
  EmbedContext | undefined
>('Embed');
