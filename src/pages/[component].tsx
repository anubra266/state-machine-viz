import React from 'react';
import { createMachine } from 'xstate';
import { GetServerSideProps } from 'next';
import { parseMachine } from '../components/parseMachine';
import { MachineVisualizer } from '../components/MachineVisualizer';

function App(props: { machineSource: string }) {
  const machine = parseMachine(props.machineSource);
  //   let machine;

  //   if (!props.status.successful) {
  //     machine = createMachine(machineSource);
  //   } else machine = parseMachine(props.machineSource);

  return <MachineVisualizer machine={machine} />;
}

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const componentName = `${context.params?.component}.js`;
  const RAW_MACHINE_PATH =
    'https://raw.githubusercontent.com/chakra-ui/zag/main/.xstate/';
  const machinePath = RAW_MACHINE_PATH + componentName;

  const fileContent = await fetch(machinePath)
    .then((r) => r.text())
    .catch((e) => console.log('e', e));

  const invalidComponent = fileContent === '404: Not Found';

  const machineSource = invalidComponent
    ? `"use strict";

    var _xstate = require("xstate");
    
    const {
      actions, createMachine
    } = _xstate;
      const fetchMachine = createMachine({
    id: "Machine not found"})`
    : fileContent;

  return {
    props: { machineSource },
  };
};
