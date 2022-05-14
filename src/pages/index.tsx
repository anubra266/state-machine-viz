import {
  Divider,
  Flex,
  Link,
  SimpleGrid,
  Stack,
  Text,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { GetServerSideProps, NextPage } from 'next';
import React from 'react';
import { FaGithub } from 'react-icons/fa';

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
          <Link
            href={`/${machine.name}`}
            position="relative"
            key={machine.name}
          >
            <Flex
              rounded="md"
              border="solid 1px"
              borderColor="whiteAlpha.200"
              p="3"
              direction="column"
              gap="12"
              transition="all .2s ease"
              _hover={{
                borderColor: 'whiteAlpha.300',
                shadow: '-4px -3px 45px 21px rgba(0,0,0,0.35)',
              }}
            >
              <Flex align="center" w="full">
                <Text
                  textTransform="capitalize"
                  fontWeight="medium"
                  textDecoration="none"
                >
                  {machine.name}
                </Text>
                <Tooltip
                  hasArrow
                  label={`Open ${machine.name} in Github`}
                  bg="whiteAlpha.100"
                  color="white"
                >
                  <IconButton
                    as={Link}
                    variant="ghost"
                    size="xs"
                    ml="auto"
                    target="_blank"
                    href={machine.git_url}
                    icon={<FaGithub />}
                    aria-label="Open in github"
                  />
                </Tooltip>
              </Flex>
            </Flex>
          </Link>
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

  const machines = machineOutputs
    .filter((mac: Machine) => !mac.name.includes('toast'))
    .map((machine: Machine) => {
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
