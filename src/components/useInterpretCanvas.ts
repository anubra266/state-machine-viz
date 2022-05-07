import { useInterpret } from '@xstate/react';
import { useEffect } from 'react';
import { canvasMachine, canvasModel } from './canvasMachine';
import './Graph';

export const useInterpretCanvas = () => {
  const canvasService = useInterpret(canvasMachine, {
    context: {
      ...canvasModel.initialContext,
    },
  });

  return canvasService;
};
