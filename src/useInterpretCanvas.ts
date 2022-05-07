import { useInterpret } from '@xstate/react';
import { useEffect } from 'react';
import { canvasMachine, canvasModel } from './components/canvasMachine';
import './components/Graph';

export const useInterpretCanvas = () => {
  const canvasService = useInterpret(canvasMachine, {
    context: {
      ...canvasModel.initialContext,
    },
  });

  return canvasService;
};
