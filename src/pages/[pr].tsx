import React from 'react';
import { MachineVisualizer } from '../components/MachineVisualizer';
import { actions, createMachine } from 'xstate';
import { parseMachine } from '../components/parseMachine';
import { GetServerSideProps } from 'next';
const { Octokit } = require('@octokit/core');

function App(props: { machineSource: string; status: Record<string, any> }) {
  let machine;

  if (!props.status.successful) {
    machine = createMachine(props.status.message);
  } else machine = parseMachine(props.machineSource);

  return <MachineVisualizer machine={machine} />;
}

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prNumber = context.params?.pr;
  const MACHINE_OUTPUT_FILE = 'output.js';
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

  async function getData() {
    try {
      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/pulls/{pull_number}/files',
        {
          owner: 'chakra-ui',
          repo: 'zag',
          pull_number: prNumber,
        },
      );
      const prFiles = response.data as Record<string, any>[];

      const outputFile = prFiles.find(
        (file) => file.filename === MACHINE_OUTPUT_FILE,
      );

      const fileContentURI = outputFile?.raw_url;
      const fileContent = await fetch(fileContentURI).then((r) => r.text());
      return fileContent;
    } catch (err) {
      return false;
    }
  }

  const fileContent = await getData();
  let status;
  if (fileContent) {
    status = {
      successful: true,
    };
  } else {
    status = {
      successful: false,
      message: { id: `Pull request ${prNumber} not found` },
    };
  }

  return {
    props: { machineSource: fileContent, status },
  };
};
