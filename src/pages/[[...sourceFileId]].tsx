import { Box, ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { useInterpret } from '@xstate/react';
import { CanvasProvider } from '../components/CanvasContext';
import { CanvasView } from '../components/CanvasView';
import { SimulationProvider } from '../components/SimulationContext';
import { simulationMachine } from '../components/simulationMachine';
import { theme } from '../theme';
import { useInterpretCanvas } from '../components/useInterpretCanvas';
import Head from 'next/head';

function App() {
  // don't use `devTools: true` here as it would freeze your browser
  const simService = useInterpret(simulationMachine);

  const canvasService = useInterpretCanvas();

  return (
    <>
      {/* 
      //? Import bundled Elk if we're on server side 
      */}
      {typeof window !== undefined && (
        <Head>
          <script src="https://unpkg.com/elkjs@0.7.1/lib/elk.bundled.js"></script>
        </Head>
      )}

      <ChakraProvider theme={theme}>
        <SimulationProvider value={simService}>
          <Box
            data-testid="app"
            data-viz-theme="dark"
            as="main"
            display="grid"
            gridTemplateColumns="1fr auto"
            gridTemplateAreas="canvas panels"
            height="100vh"
          >
            <CanvasProvider value={canvasService}>
              <CanvasView />
            </CanvasProvider>
          </Box>
        </SimulationProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
