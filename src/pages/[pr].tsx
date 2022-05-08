import React, { useEffect, useState } from 'react';
import { MachineVisualizer } from '../components/MachineVisualizer';
import { actions } from 'xstate';
import { parseMachine } from '../components/parseMachine';
import { GetServerSideProps } from 'next';
const { Octokit } = require('@octokit/core');

const { choose } = actions;

function App(props: { machineSource: string }) {
  const machine = parseMachine(props.machineSource);

  return <MachineVisualizer machine={machine} />;
}

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prNumber = context.params?.pr;
  const MACHINE_OUTPUT_FILE = 'output.js';
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
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

  return {
    props: { machineSource: fileContent },
  };
};
