import { useSelector } from '@xstate/react';
import React from 'react';
import {
  ActionObject,
  ActionTypes,
  AnyEventObject,
  CancelAction,
  Interpreter,
  SendAction,
  StateNode,
  TransitionDefinition,
} from 'xstate';

const testPlatform = (re: RegExp): boolean =>
  re.test(globalThis?.navigator?.platform);

export const isMac = () => testPlatform(/^Mac/);

export const isWithPlatformMetaKey = (event: {
  metaKey: boolean;
  ctrlKey: boolean;
}) => (isMac() ? event.metaKey : event.ctrlKey);

const isTextAcceptingInputElement = (input: HTMLInputElement) =>
  input.type === 'email' ||
  input.type === 'password' ||
  input.type === 'search' ||
  input.type === 'tel' ||
  input.type === 'text' ||
  input.type === 'url';

const isSvgElement = (el: any): el is SVGElement =>
  !!el && (/svg/i.test(el.tagName) || !!el.ownerSVGElement);

export const isTextInputLikeElement = (
  el: HTMLElement | SVGElement,
): boolean => {
  return (
    (el.tagName === 'INPUT' &&
      isTextAcceptingInputElement(el as HTMLInputElement)) ||
    el.tagName === 'TEXTAREA' ||
    (!isSvgElement(el) && el.isContentEditable)
  );
};

export const isAcceptingArrowKey = (el: HTMLElement | SVGElement): boolean => {
  return isTextInputLikeElement(el);
};

export const isStringifiedFunction = (str: string): boolean =>
  /^function\s*\(/.test(str) || str.includes('=>');

export function isDelayedTransitionAction(
  action: ActionObject<any, any>,
): boolean {
  switch (action.type) {
    case ActionTypes.Send: {
      const sendAction = action as SendAction<
        unknown,
        AnyEventObject,
        AnyEventObject
      >;
      return (
        typeof sendAction.event === 'object' &&
        sendAction.event.type.startsWith('xstate.after')
      );
    }
    case ActionTypes.Cancel:
      return `${(action as CancelAction).sendId}`.startsWith('xstate.after');
    default:
      return false;
  }
}

const getRoles = (el: HTMLElement | SVGElement): string[] => {
  const explicitRole = el.getAttribute('role');

  if (explicitRole) {
    // based on https://github.com/testing-library/dom-testing-library/blob/fbbb29a6d9655d41bc8f91d49dc64326f588c0d6/src/queries/role.js#L107-L112
    return explicitRole.split(' ').filter(Boolean);
  }

  // this is obviously highly incomplete atm
  switch (el.tagName) {
    case 'BUTTON':
      return ['button'];
    case 'SELECT': {
      const multiple = el.getAttribute('multiple');
      const size = el.getAttribute('multiple');
      return multiple && size && parseInt(size) > 1
        ? ['listbox']
        : ['combobox'];
    }
    case 'INPUT': {
      const input = el as HTMLInputElement;
      switch (input.type) {
        case 'button':
        case 'image':
        case 'reset':
        case 'submit':
          return ['button'];
        case 'checkbox':
          return ['checkbox'];
        case 'email':
        case 'search':
        case 'tel':
        case 'text':
        case 'url':
          return el.getAttribute('list') ? ['combobox'] : ['textbox'];
        case 'number':
          return ['spinbutton'];
        case 'radio':
          return ['radio'];
        case 'range':
          return ['slider'];
        default:
          return [];
      }
    }
    case 'TEXTAREA':
      return ['textbox'];
    default:
      return [];
  }
};

export function createRequiredContext<T>(displayName: string) {
  const context = React.createContext<T | null>(null);
  context.displayName = displayName;

  const useContext = () => {
    const ctx = React.useContext(context);
    if (!ctx) {
      throw new Error(
        `use${displayName} must be used inside ${displayName}Provider`,
      );
    }
    return ctx;
  };

  return [context.Provider, useContext] as const;
}

export const isAcceptingSpaceNatively = (
  el: HTMLElement | SVGElement,
): boolean =>
  // from all the inputs `number` and `range` don't seem to accept space but it's probably not worth it to special case them here
  el.tagName === 'INPUT' ||
  isTextInputLikeElement(el) ||
  getRoles(el).includes('button');

export function getChildren(stateNode: StateNode): StateNode[] {
  if (!stateNode.states) {
    return [];
  }

  const children = Object.keys(stateNode.states).map((key) => {
    return stateNode.states[key];
  });

  children.sort((a, b) => b.order - a.order);

  return children;
}

export function createInterpreterContext<
  TInterpreter extends Interpreter<any, any, any>,
>(displayName: string) {
  const [Provider, useContext] =
    createRequiredContext<TInterpreter>(displayName);

  const createUseSelector =
    <Data>(selector: (state: TInterpreter['state']) => Data) =>
    () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSelector(useContext(), selector);
    };

  return [Provider, useContext, createUseSelector] as const;
}

export const visualizeMessage = (message: string) => {
  return `"use strict";

var _xstate = require("xstate");

const {
  actions, createMachine
} = _xstate;
  const fetchMachine = createMachine({
    id: "${message}"})`;
};

type Action = string | string[];
type Cond = string;
type Target = string;
type Transition = { actions?: Action; cond?: Cond; target?: Target };
type Event = Transition | Transition[];

export const COND_TYPES = {
  ONE: 'one',
  MANY: 'many',
  BOOLEAN: 'boolean',
  NONE: 'none',
} as const;

export const parseConditions = (definition: TransitionDefinition<any, any>) => {
  const events = definition.source.config.on as Record<string, Event>;
  const event = events[definition.eventType];

  if (typeof event === 'string') {
    return [COND_TYPES.NONE, null] as const;
  } else if (Array.isArray(event)) {
    const conds = event
      .filter((cond) => 'cond' in cond)
      .map((cond) => ({ cond: cond.cond, target: cond.target }));

    if (event.length === 1) {
      return [conds[0] ? COND_TYPES.ONE : COND_TYPES.NONE, conds[0]] as const;
    } else if (event.length > 1) {
      if (conds.length > 1) {
        //pass event for cases where there's a default branch
        return [COND_TYPES.MANY, event] as const;
      } else if (conds.length === 1) {
        return [COND_TYPES.BOOLEAN, conds[0]] as const;
      }
    }
  } else if (event && 'cond' in event) {
    return [
      COND_TYPES.ONE,
      { cond: event.cond, target: event.target },
    ] as const;
  }

  return [COND_TYPES.NONE] as const;
};
