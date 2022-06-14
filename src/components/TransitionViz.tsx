import { useSelector } from '@xstate/react';
import React, { useMemo } from 'react';
import type { AnyStateNodeDefinition, Guard } from 'xstate';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
  useDisclosure,
  ButtonGroup,
  Button,
  Stack,
  Flex,
  Text,
} from '@chakra-ui/react';

import { DirectedGraphEdge } from './directedGraph';
import { EventTypeViz, toDelayString } from './EventTypeViz';
import { Point } from './pathUtils';
import { useSimulation } from './SimulationContext';
import { AnyStateMachine, StateFrom } from './types';
import { toSCXMLEvent } from 'xstate/lib/utils';
import { simulationMachine } from './simulationMachine';
import { ActionViz } from './ActionViz';
import { DelayViz } from './DelayViz';
import { COND_TYPES, parseConditions } from './utils';
import { useRef } from 'react';

const getGuardType = (guard: Guard<any, any>) => {
  const guardName = guard.name.replace(
    /&&|\|\||\.|\(|\)/g,
    (m: string) =>
      `<span class="${
        ['(', ')'].includes(m) ? 'bracket' : 'operator'
      }">${m}</span>`,
  );
  return guardName; // v4
};

export type DelayedTransitionMetadata =
  | { delayType: 'DELAYED_INVALID' }
  | { delayType: 'DELAYED_VALID'; delay: number; delayString: string };

const getDelayFromEventType = (
  eventType: string,
  delayOptions: AnyStateMachine['options']['delays'],
  context: AnyStateNodeDefinition['context'],
  event: any,
): DelayedTransitionMetadata | undefined => {
  try {
    const isDelayedEvent = eventType.startsWith('xstate.after');

    if (!isDelayedEvent) return undefined;

    const DELAYED_EVENT_REGEXT = /^xstate\.after\((.*)\)#.*$/;
    // Validate the delay duration
    const match = eventType.match(DELAYED_EVENT_REGEXT);

    if (!match) return { delayType: 'DELAYED_INVALID' };

    let [, delay] = match;

    // normal number or stringified number delays
    let finalDelay = +delay;

    // if configurable delay, get it from the machine options
    if (Number.isNaN(finalDelay)) {
      const delayExpr = delayOptions[delay];
      // if configured delay is a fixed number value
      if (typeof delayExpr === 'number') {
        finalDelay = delayExpr;
      } else {
        // if configured delay is getter function
        // @ts-expect-error
        finalDelay = delayExpr(context, event);
      }
    }

    return {
      delayType: 'DELAYED_VALID',
      delay: finalDelay,
      delayString: toDelayString(delay),
    };
  } catch (err) {
    console.log(err);
    return;
  }
};

const delayOptionsSelector = (state: StateFrom<typeof simulationMachine>) =>
  state.context.serviceDataMap[state.context.currentSessionId!]?.machine.options
    ?.delays;

export const TransitionViz: React.FC<{
  edge: DirectedGraphEdge;
  position?: Point;
  index: number;
}> = ({ edge, index, position }) => {
  const definition = edge.transition;
  const service = useSimulation();
  const state = useSelector(
    service,
    (s) => s.context.serviceDataMap[s.context.currentSessionId!]?.state,
  );
  const initialRef = useRef<HTMLButtonElement | null>(null);

  const delayOptions = useSelector(service, delayOptionsSelector);
  const delay = useMemo(
    () =>
      delayOptions
        ? getDelayFromEventType(
            definition.eventType,
            delayOptions,
            state?.context,
            state?.event,
          )
        : undefined,
    [definition.eventType, delayOptions, state],
  );

  if (!state) {
    return null;
  }

  const isDisabled =
    delay?.delayType === 'DELAYED_INVALID' ||
    !state.nextEvents.includes(definition.eventType);
  const isPotential =
    state.nextEvents.includes(edge.transition.eventType) &&
    !!state.configuration.find((sn) => sn === edge.source);

  const popoverState = useDisclosure();
  const [conditionType, conditions] = parseConditions(definition);

  const directConditions = [
    COND_TYPES.NONE,
    COND_TYPES.ONE,
  ] as typeof COND_TYPES[keyof typeof COND_TYPES][];

  const transitionConfig = {
    type: 'SERVICE.SEND',
    event: toSCXMLEvent(
      {
        type: definition.eventType,
      },
      { origin: state._sessionid as string },
    ),
  } as const;

  const singleConditionCOnfig = {
    type: 'SERVICE.SEND',
    event: toSCXMLEvent(
      {
        type: 'UPDATE_CONTEXT',
        contextKey: !Array.isArray(conditions) && conditions?.cond,
      },
      { origin: state._sessionid as string },
    ),
  } as const;

  const acceptSingleCondition = () => {
    service.send([singleConditionCOnfig, transitionConfig]);
    popoverState.onClose();
  };

  const normalTransition = () => {
    service.send(transitionConfig);
    popoverState.onClose();
  };

  const acceptGivenCondition = (condition?: string) => {
    if (condition) {
      service.send([
        {
          type: 'SERVICE.SEND',
          event: toSCXMLEvent(
            {
              type: 'UPDATE_CONTEXT',
              contextKey: condition,
            },
            { origin: state._sessionid as string },
          ),
        },
        transitionConfig,
      ]);
    }
    popoverState.onClose();
  };

  const manyWithSameState =
    conditionType === COND_TYPES.MANY &&
    Array.isArray(conditions) &&
    Object.keys(
      conditions.reduce((acc, nxt) => {
        if (nxt.target) {
          return {
            ...acc,
            [nxt.target]: acc[nxt.target] ? acc[nxt.target] + 1 : 1,
          };
        }
        return acc;
      }, {} as Record<string, any>),
    ).length === 1;

  return (
    <Popover
      initialFocusRef={initialRef}
      isOpen={popoverState.isOpen}
      onClose={popoverState.onClose}
    >
      <PopoverTrigger>
        <button
          data-viz="transition"
          data-viz-potential={isPotential || undefined}
          data-viz-disabled={isDisabled || undefined}
          data-is-delayed={delay ?? undefined}
          data-rect-id={edge.id}
          style={{
            position: 'absolute',
            ...(position && {
              left: `${position.x}px`,
              top: `${position.y}px`,
            }),
            // @ts-ignore
            '--delay': delay?.delayType === 'DELAYED_VALID' && delay.delay,
          }}
          disabled={isDisabled}
          onMouseEnter={() => {
            service.send({
              type: 'EVENT.PREVIEW',
              eventType: definition.eventType,
            });
          }}
          onMouseLeave={() => {
            service.send({
              type: 'PREVIEW.CLEAR',
            });
          }}
          onClick={() => {
            if (!directConditions.includes(conditionType)) {
              //? let user decide next state
              popoverState.onOpen();
            } else if (conditionType === COND_TYPES.ONE) {
              acceptSingleCondition();
            } else {
              normalTransition();
            }
          }}
        >
          <div data-viz="transition-label">
            <span data-viz="transition-event">
              <EventTypeViz eventType={definition.eventType} delay={delay} />
              {delay && delay.delayType === 'DELAYED_VALID' && (
                <DelayViz active={isPotential} duration={delay.delay} />
              )}
            </span>
            {definition.cond && (
              <span
                data-viz="transition-guard"
                dangerouslySetInnerHTML={{
                  __html: getGuardType(definition.cond),
                }}
              />
            )}
          </div>
          <div data-viz="transition-content">
            {definition.actions.length > 0 && (
              <div data-viz="transition-actions">
                {definition.actions.map((action, index) => {
                  return <ActionViz key={index} action={action} kind="do" />;
                })}
              </div>
            )}
          </div>
          {definition.description && (
            <div data-viz="transition-description">
              <p>{definition.description}</p>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          sx={{
            '--popper-bg': '#111',
            fontSize: '12px',
          }}
        >
          <PopoverArrow />
          <PopoverCloseButton zIndex="popover" />
          <PopoverHeader>Decide Next state</PopoverHeader>
          <PopoverBody>
            {conditionType === COND_TYPES.BOOLEAN &&
              !Array.isArray(conditions) && (
                <>
                  Do you want to set `{conditions?.cond}` to true?
                  <br />
                  <ButtonGroup size="xs" mt="2">
                    <Button ref={initialRef} onClick={acceptSingleCondition}>
                      Yes
                    </Button>
                    <Button variant="outline" onClick={normalTransition}>
                      No
                    </Button>
                  </ButtonGroup>
                </>
              )}

            {conditionType === COND_TYPES.MANY && Array.isArray(conditions) && (
              <Stack>
                <span>Stack Choose what conditions you want to fulfill.</span>
                {manyWithSameState && (
                  <Text fontSize="xx-small" color="gray.200">
                    When they lead to the same states, it means they perform
                    different actions, based on the fulfilled conditions
                  </Text>
                )}
                <Stack>
                  {conditions.map((c, i) => (
                    <Flex key={c.cond} align="center">
                      <Button
                        size="xs"
                        color={!!c.cond ? 'inherit' : 'blue.200'}
                        ref={i === 0 ? initialRef : null}
                        onClick={() => acceptGivenCondition(c.cond)}
                      >
                        {c.cond || 'No condition'}
                      </Button>
                      {c.target && (
                        <Text ml="auto" textTransform="capitalize">
                          - {c.target} state
                        </Text>
                      )}
                    </Flex>
                  ))}
                </Stack>
              </Stack>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
