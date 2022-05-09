import React from 'react';
import { MachineVisualizer } from '../components/MachineVisualizer';
import { parseMachine } from '../components/parseMachine';

function App() {
  const machine = parseMachine(stringMachine);

  return <MachineVisualizer machine={machine} />;
}

export default App;

const stringMachine = `"use strict";

var _xstate = require("xstate");

const {
  choose
} = _xstate.actions;
const fetchMachine = (0, _xstate.createMachine)({
  id: "example-toggle-machine",
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
