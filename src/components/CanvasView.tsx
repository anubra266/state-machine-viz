import {
  AddIcon,
  MinusIcon,
  RepeatIcon,
  HamburgerIcon,
  ArrowBackIcon,
} from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, IconButton } from '@chakra-ui/react';
import { useSelector } from '@xstate/react';
import React, { useMemo } from 'react';
import { CanvasContainer } from './CanvasContainer';
import { useCanvas } from './CanvasContext';
import { canZoomIn, canZoomOut } from './canvasMachine';
import { toDirectedGraph } from './directedGraph';
import { Graph } from './Graph';
import { useSimulation, useSimulationMode } from './SimulationContext';
import { CompressIcon, HandIcon } from './Icons';

export const CanvasView: React.FC = () => {
  const [panModeEnabled, setPanModeEnabled] = React.useState(false);
  const simService = useSimulation();
  const canvasService = useCanvas();

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

  return (
    <Box display="grid" height="100%">
      <CanvasContainer panModeEnabled={panModeEnabled}>
        {digraph && <Graph digraph={digraph} />}
      </CanvasContainer>

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
        <IconButton
          aria-label="Pan mode"
          icon={<HandIcon />}
          size="sm"
          marginLeft={2}
          onClick={() => setPanModeEnabled((v) => !v)}
          aria-pressed={panModeEnabled}
          variant={panModeEnabled ? 'secondaryPressed' : 'secondary'}
        />
        {/* {simulationMode === 'visualizing' && (
          <Button
            size="sm"
            marginLeft={2}
            onClick={() => simService.send('MACHINES.RESET')}
            variant="secondary"
          >
            RESET
          </Button>
        )} */}
        <IconButton
          size="sm"
          isRound
          aria-label="Edit Machine"
          marginLeft="auto"
          variant="secondary"
          icon={<ArrowBackIcon boxSize="4" />}
          onClick={() => history.back()}
        />
      </Box>
    </Box>
  );
};
