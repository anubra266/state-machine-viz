import React from 'react';
import { GetServerSideProps } from 'next';
import { parseMachine } from '../components/parseMachine';
import { MachineVisualizer } from '../components/MachineVisualizer';
import { visualizeMessage } from '../components/utils';

function App(props: { machineSource: string }) {
  const machine = parseMachine(props.machineSource);
  return <MachineVisualizer machine={machine} />;
}

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const componentName = `${context.params?.component}.js`;
  const RAW_MACHINE_PATH =
    'https://raw.githubusercontent.com/chakra-ui/zag/main/.xstate/';
  const machinePath = RAW_MACHINE_PATH + componentName;

  const fileContent = await fetch(machinePath).then((r) => r.text());

  const invalidComponent = fileContent === '404: Not Found';

  const machineSource = invalidComponent
    ? visualizeMessage('Machine not found 😔')
    : fileContent.replace('id,', `id: "${context.params?.component}",`);

  return {
    props: { machineSource },
  };
};
