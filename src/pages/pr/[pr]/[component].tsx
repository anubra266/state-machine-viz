import React from 'react';
import { MachineVisualizer } from '../../../components/MachineVisualizer';
import { parseMachine } from '../../../components/parseMachine';
import { GetServerSideProps } from 'next';
import { visualizeMessage } from '../../../components/utils';
const { Octokit } = require('@octokit/core');

function App(props: { machineSource: string; status: Record<string, any> }) {
  const machine = parseMachine(props.machineSource);

  return <MachineVisualizer machine={machine} />;
}

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prNumber = context.params?.pr;
  const componentName = `${context.params?.component}.js`;
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

      const outputFile = prFiles.find((file) =>
        file.filename.endsWith(componentName),
      );

      const fileContentURI = outputFile?.raw_url;
      const fileContent = await fetch(fileContentURI).then((r) => r.text());
      return fileContent;
    } catch (err) {
      return false;
    }
  }

  const fileContent = await getData();
  const machineSource = fileContent || visualizeMessage('Machine not found 😔');

  return {
    props: { machineSource },
  };
};
