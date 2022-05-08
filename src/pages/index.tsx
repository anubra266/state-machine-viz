import React, { useEffect, useState } from 'react';
import { MachineVisualizer } from '../components/MachineVisualizer';
import { actions } from 'xstate';
import { parseMachine } from '../components/parseMachine';

const { choose } = actions;

function App() {
  const defaultMachine = parseMachine(stringMachine);

  const [machine, setMachine] = useState<any>(defaultMachine);

  return <MachineVisualizer machine={machine} />;
}

export default App;

const stringMachine = `"use strict";

var _xstate = require("xstate");

const {
  choose
} = _xstate.actions;
const fetchMachine = (0, _xstate.createMachine)({
  id: "toggle-machine",
  initial: "unknown",
  states: {
    unknown: {
      on: {
        SETUP: {
          target: "unpressed",
          actions: "setupDocument"
        }
      }
    },
    pressed: {
      on: {
        CLICK: "unpressed"
      }
    },
    unpressed: {
      on: {
        CLICK: "pressed"
      }
    }
  }
});`;

const defMachine = {
  id: 'toggle-machine',
  initial: 'unknown',
  states: {
    unknown: {
      on: {
        SETUP: {
          target: 'unpressed',
          actions: 'setupDocument',
        },
      },
    },
    pressed: {
      entry: choose([
        { cond: 'isSomething', actions: 'unpressed' },
        { cond: 'isSomethingElse', actions: 'unknown' },
      ]),
      on: {
        CLICK: 'unpressed',
      },
    },
    unpressed: {
      on: {
        CLICK: 'pressed',
      },
    },
  },
};
