import {
  Box,
  Divider,
  Flex,
  Link,
  SimpleGrid,
  Stack,
  Text,
  chakra,
  IconButton,
  ButtonGroup,
  StatHelpText,
  StatArrow,
  Stat,
  LinkBox,
  Tooltip,
} from '@chakra-ui/react';
import { pick } from '@chakra-ui/utils';
import { GetServerSideProps, NextPage } from 'next';
import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiDgraph } from 'react-icons/si';

const { Octokit } = require('@octokit/core');

type Machine = {
  name: string;
  git_url: string;
};
type IndexProps = {
  machines: Machine[];
};

export const Index = (props: NextPage & IndexProps) => {
  const { machines } = props;

  return (
    <Stack py="10" px="20" overflow="auto" maxH="100vh">
      <div>
        <Text fontSize="2xl" fontWeight="medium">
          Zag JS Machines
        </Text>
        <Divider />
      </div>
      <SimpleGrid minChildWidth="250px" spacing="6" pt="8">
        {machines.map((machine) => (
          <chakra.div position="relative" key={machine.name}>
            <Flex
              rounded="md"
              border="solid 1px"
              borderColor="whiteAlpha.200"
              p="3"
              direction="column"
              gap="12"
            >
              <Flex align="center" w="full">
                <Text textTransform="capitalize" fontWeight="medium">
                  {machine.name}
                </Text>
                <ButtonGroup size="xs" ml="auto" variant="ghost" spacing="1">
                  <IconButton
                    as={Link}
                    target="_blank"
                    href={machine.git_url}
                    icon={<FaGithub />}
                    aria-label="Open in github"
                  />
                  <Tooltip
                    hasArrow
                    label={`Visualize ${machine.name
                      .split('-')
                      .join(' ')} machine`}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <IconButton
                      variant="solid"
                      colorScheme="purple"
                      as={Link}
                      href={`/${machine.name}`}
                      icon={<SiDgraph />}
                      aria-label="Visualize"
                    />
                  </Tooltip>
                </ButtonGroup>
              </Flex>
            </Flex>
          </chakra.div>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

  const { data: machineOutputs } = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner: 'chakra-ui',
      repo: 'zag',
      path: '.xstate',
    },
  );

  const machines = machineOutputs.map((machine: Machine) => {
    const name = machine.name.split('.')[0];
    const git_url = `https://github.com/chakra-ui/zag/blob/main/packages/machines/${name}/src/${name}.machine.ts`;
    return {
      name,
      git_url,
    };
  });

  return {
    props: { machines },
  };
};
