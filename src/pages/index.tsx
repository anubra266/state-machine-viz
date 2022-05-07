import { Box, ChakraProvider } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useInterpret } from '@xstate/react';
import { CanvasProvider } from '../components/CanvasContext';
import { CanvasView } from '../components/CanvasView';
import { SimulationProvider } from '../components/SimulationContext';
import { simulationMachine } from '../components/simulationMachine';
import { theme } from '../theme';
import { useInterpretCanvas } from '../components/useInterpretCanvas';
import Head from 'next/head';
import { styles } from '../components/styles';
import { createMachine } from 'xstate';

function App() {
  // don't use `devTools: true` here as it would freeze your browser
  const simService = useInterpret(simulationMachine);

  const canvasService = useInterpretCanvas();

  useEffect(() => {
    simService.send({
      type: 'MACHINES.REGISTER',
      machines: [machine],
    });
  }, []);

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
        <Box sx={styles}>
          <SimulationProvider value={simService}>
            <Box
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
        </Box>
      </ChakraProvider>
    </>
  );
}

export default App;

const machine = createMachine({
  id: 'combobox',
  initial: 'unknown',
  exit: 'removeLiveRegion',
  on: {
    SET_VALUE: {
      actions: ['setInputValue', 'setSelectedValue'],
    },
    CLEAR_VALUE: [
      {
        cond: 'focusOnClear',
        target: 'focused',
        actions: 'clearInputValue',
      },
      {
        actions: 'clearInputValue',
      },
    ],
  },
  states: {
    unknown: {
      tags: ['idle'],
      on: {
        SETUP: [
          {
            cond: 'autoFocus',
            target: 'focused',
            actions: 'setupDocument',
          },
          {
            target: 'idle',
            actions: 'setupDocument',
          },
        ],
      },
    },
    idle: {
      tags: ['idle'],
      entry: ['scrollToTop', 'clearFocusedOption', 'clearPointerdownNode'],
      on: {
        CLICK_BUTTON: {
          target: 'interacting',
          actions: ['focusInput', 'invokeOnOpen'],
        },
        POINTER_DOWN: {
          cond: 'openOnClick',
          target: 'interacting',
          actions: ['focusInput', 'invokeOnOpen'],
        },
        POINTER_OVER: {
          actions: 'setIsHovering',
        },
        POINTER_LEAVE: {
          actions: 'clearIsHovering',
        },
        FOCUS: 'focused',
      },
    },
    focused: {
      tags: ['focused'],
      entry: [
        'focusInput',
        'scrollToTop',
        'clearFocusedOption',
        'clearPointerdownNode',
      ],
      on: {
        CHANGE: {
          target: 'suggesting',
          actions: 'setInputValue',
        },
        BLUR: 'idle',
        ESCAPE: {
          cond: 'isCustomValue && !allowCustomValue',
          actions: 'revertInputValue',
        },
        CLICK_BUTTON: {
          target: 'interacting',
          actions: ['focusInput', 'invokeOnOpen'],
        },
        POINTER_OVER: {
          actions: 'setIsHovering',
        },
        ARROW_UP: [
          {
            cond: 'autoComplete',
            target: 'interacting',
            actions: 'invokeOnOpen',
          },
          {
            target: 'interacting',
            actions: ['focusLastOption', 'invokeOnOpen'],
          },
        ],
        ARROW_DOWN: [
          {
            cond: 'autoComplete',
            target: 'interacting',
            actions: 'invokeOnOpen',
          },
          {
            target: 'interacting',
            actions: ['focusFirstOption', 'invokeOnOpen'],
          },
        ],
        ALT_ARROW_DOWN: {
          target: 'interacting',
          actions: ['focusInput', 'invokeOnOpen'],
        },
      },
    },
    suggesting: {
      tags: ['open', 'focused'],
      activities: [
        'trackPointerDown',
        'scrollOptionIntoView',
        'computePlacement',
        'trackOptionNodes',
        'ariaHideOutside',
      ],
      entry: ['focusInput', 'invokeOnOpen'],
      on: {
        ARROW_DOWN: {
          target: 'interacting',
          actions: 'focusNextOption',
        },
        ARROW_UP: {
          target: 'interacting',
          actions: 'focusPrevOption',
        },
        ALT_ARROW_UP: 'focused',
        HOME: {
          target: 'interacting',
          actions: ['focusFirstOption', 'preventDefault'],
        },
        END: {
          target: 'interacting',
          actions: ['focusLastOption', 'preventDefault'],
        },
        ENTER: [
          {
            cond: 'isOptionFocused && autoComplete',
            target: 'focused',
            actions: 'selectActiveOption',
          },
          {
            cond: 'isOptionFocused',
            target: 'focused',
            actions: 'selectOption',
          },
        ],
        CHANGE: [
          {
            cond: 'autoHighlight',
            actions: [
              'clearFocusedOption',
              'setInputValue',
              'focusFirstOption',
            ],
          },
          {
            actions: ['clearFocusedOption', 'setInputValue'],
          },
        ],
        ESCAPE: {
          target: 'focused',
          actions: 'invokeOnClose',
        },
        POINTEROVER_OPTION: [
          {
            cond: 'autoComplete',
            target: 'interacting',
            actions: 'setActiveId',
          },
          {
            target: 'interacting',
            actions: ['setActiveId', 'setNavigationValue'],
          },
        ],
        BLUR: {
          target: 'idle',
          actions: 'invokeOnClose',
        },
        CLICK_BUTTON: {
          target: 'focused',
          actions: 'invokeOnClose',
        },
      },
    },
    interacting: {
      tags: ['open', 'focused'],
      activities: [
        'scrollOptionIntoView',
        'trackPointerDown',
        'computePlacement',
        'ariaHideOutside',
      ],
      entry: 'focusMatchingOption',
      on: {
        HOME: {
          actions: ['focusFirstOption', 'preventDefault'],
        },
        END: {
          actions: ['focusLastOption', 'preventDefault'],
        },
        ARROW_DOWN: [
          {
            cond: 'autoComplete && isLastOptionFocused',
            actions: ['clearFocusedOption', 'scrollToTop'],
          },
          {
            actions: 'focusNextOption',
          },
        ],
        ARROW_UP: [
          {
            cond: 'autoComplete && isFirstOptionFocused',
            actions: 'clearFocusedOption',
          },
          {
            actions: 'focusPrevOption',
          },
        ],
        ALT_UP: {
          target: 'focused',
          actions: ['selectOption', 'invokeOnClose'],
        },
        CLEAR_FOCUS: {
          actions: 'clearFocusedOption',
        },
        TAB: {
          cond: 'selectOnTab',
          target: 'idle',
          actions: ['selectOption', 'invokeOnClose'],
        },
        ENTER: {
          target: 'focused',
          actions: ['selectOption', 'invokeOnClose'],
        },
        CHANGE: [
          {
            cond: 'autoComplete',
            target: 'suggesting',
            actions: ['commitNavigationValue', 'setInputValue'],
          },
          {
            target: 'suggesting',
            actions: ['clearFocusedOption', 'setInputValue'],
          },
        ],
        POINTEROVER_OPTION: [
          {
            cond: 'autoComplete',
            actions: 'setActiveId',
          },
          {
            actions: ['setActiveId', 'setNavigationValue'],
          },
        ],
        CLICK_OPTION: {
          target: 'focused',
          actions: ['selectOption', 'invokeOnClose'],
        },
        ESCAPE: {
          target: 'focused',
          actions: 'invokeOnClose',
        },
        CLICK_BUTTON: {
          target: 'focused',
          actions: 'invokeOnClose',
        },
        BLUR: {
          target: 'idle',
          actions: 'invokeOnClose',
        },
      },
    },
  },
});
