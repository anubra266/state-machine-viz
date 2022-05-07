import * as XState from 'xstate';
import { StateNode } from 'xstate';
import realmsShim from 'realms-shim';
import { machine2 } from './components/CanvasView';

const realm = realmsShim.makeRootRealm();

const wrapCallbackToPreventThis =
  (callback: (...args: any[]) => void) =>
  (...args: any[]) => {
    return callback(...args);
  };

const windowShim = {
  setInterval: (callback: (...args: any[]) => void, ...args: any[]) => {
    return setInterval(wrapCallbackToPreventThis(callback), ...args);
  },
  setTimeout: (callback: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(wrapCallbackToPreventThis(callback), ...args);
  },
  clearTimeout: (...args: any[]) => {
    return clearTimeout(...args);
  },
  clearInterval: (...args: any[]) => {
    return clearInterval(...args);
  },
};

export function parseMachines(sourceJs: string): Array<StateNode> {
  const machines: Array<StateNode> = [];

  const machine = machine2;
  // const machine = machineFactory(...args);
  machines.push(machine);

  return machines;
}
