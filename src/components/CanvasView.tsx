import {
  AddIcon,
  MinusIcon,
  RepeatIcon,
  QuestionOutlineIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
} from '@chakra-ui/react';
import { useSelector } from '@xstate/react';
import xstatePkgJson from 'xstate/package.json';
import React, { useEffect, useMemo } from 'react';
import { CanvasContainer } from './CanvasContainer';
import { useCanvas } from './CanvasContext';
import { canZoomIn, canZoomOut } from './canvasMachine';
import { toDirectedGraph } from './directedGraph';
import { Graph } from './Graph';
import { useSimulation, useSimulationMode } from './SimulationContext';
import { CompressIcon, HandIcon } from './Icons';
import { createMachine } from 'xstate';

export const machine2 = createMachine({
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

export const CanvasView: React.FC = () => {
  // TODO: refactor this so an event can be explicitly sent to a machine
  // it isn't straightforward to do at the moment cause the target machine lives in a child component
  const [panModeEnabled, setPanModeEnabled] = React.useState(false);
  const simService = useSimulation();
  const canvasService = useCanvas();

  useEffect(() => {
    simService.send({
      type: 'MACHINES.REGISTER',
      machines: [machine2],
    });
  }, []);

  const machine = useSelector(simService, (state) => {
    return state.context.currentSessionId
      ? state.context.serviceDataMap[state.context.currentSessionId!]?.machine
      : undefined;
  });

  const isEmpty = useSelector(simService, (state) => state.hasTag('empty'));
  const digraph = useMemo(
    () => (machine ? toDirectedGraph(machine) : undefined),
    [machine],
  );

  const shouldEnableZoomOutButton = useSelector(canvasService, (state) =>
    canZoomOut(state.context),
  );

  const shouldEnableZoomInButton = useSelector(canvasService, (state) =>
    canZoomIn(state.context),
  );

  const simulationMode = useSimulationMode();

  const showControls = true;

  const showZoomButtonsInEmbed = true;
  const showPanButtonInEmbed = true;

  return (
    <Box display="grid" height="100%">
      <CanvasContainer panModeEnabled={panModeEnabled}>
        {digraph && <Graph digraph={digraph} />}
      </CanvasContainer>

      {showControls && (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-start"
          position="absolute"
          bottom={0}
          left={0}
          paddingX={2}
          paddingY={3}
          zIndex={1}
          width="100%"
          data-testid="controls"
        >
          <ButtonGroup size="sm" spacing={2} isAttached>
            {showZoomButtonsInEmbed && (
              <>
                <IconButton
                  aria-label="Zoom out"
                  title="Zoom out"
                  icon={<MinusIcon />}
                  disabled={!shouldEnableZoomOutButton}
                  onClick={() => canvasService.send('ZOOM.OUT')}
                  variant="secondary"
                />
                <IconButton
                  aria-label="Zoom in"
                  title="Zoom in"
                  icon={<AddIcon />}
                  disabled={!shouldEnableZoomInButton}
                  onClick={() => canvasService.send('ZOOM.IN')}
                  variant="secondary"
                />
              </>
            )}
            <IconButton
              aria-label="Fit to content"
              title="Fit to content"
              icon={<CompressIcon />}
              onClick={() => canvasService.send('FIT_TO_CONTENT')}
              variant="secondary"
            />
            <IconButton
              aria-label="Reset canvas"
              title="Reset canvas"
              icon={<RepeatIcon />}
              onClick={() => canvasService.send('POSITION.RESET')}
              variant="secondary"
            />
          </ButtonGroup>
          {showPanButtonInEmbed && (
            <IconButton
              aria-label="Pan mode"
              icon={<HandIcon />}
              size="sm"
              marginLeft={2}
              onClick={() => setPanModeEnabled((v) => !v)}
              aria-pressed={panModeEnabled}
              variant={panModeEnabled ? 'secondaryPressed' : 'secondary'}
            />
          )}
          {simulationMode === 'visualizing' && (
            <Button
              size="sm"
              marginLeft={2}
              onClick={() => simService.send('MACHINES.RESET')}
              variant="secondary"
            >
              RESET
            </Button>
          )}
          <Menu closeOnSelect={true} placement="top-end">
            <MenuButton
              as={IconButton}
              size="sm"
              isRound
              aria-label="More info"
              marginLeft="auto"
              variant="secondary"
              icon={
                <QuestionOutlineIcon
                  boxSize={6}
                  css={{ '& circle': { display: 'none' } }}
                />
              }
            />
            <Portal>
              <MenuList fontSize="sm" padding="0">
                <MenuItem
                  as={Link}
                  href="https://github.com/statelyai/xstate-viz/issues/new?template=bug_report.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report an issue
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="https://github.com/statelyai/xstate"
                  target="_blank"
                  rel="noreferrer"
                >
                  {`XState version ${xstatePkgJson.version}`}
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="https://stately.ai/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      )}
    </Box>
  );
};
