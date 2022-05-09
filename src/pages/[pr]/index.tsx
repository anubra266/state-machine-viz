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
import NextLink from 'next/link';

const { Octokit } = require('@octokit/core');

type IndexProps = {
  prNumber: number;
  machineFiles:
    | false
    | {
        additions: any;
        filename: any;
        blob_url: any;
        changes: any;
        deletions: any;
        status: 'added' | 'modified';
      }[];
};

export const Index = (props: NextPage & IndexProps) => {
  const { prNumber, machineFiles } = props;
  const prLink = `https://github.com/chakra-ui/zag/pull/${prNumber}`;

  if (!machineFiles) return 'Pull Request not found';

  return (
    <Stack py="10" px="20" overflow="auto" maxH="100vh">
      <div>
        <Text fontSize="2xl" fontWeight="medium">
          Updated machines for{' '}
          <Link href={prLink} target="_blank" color="blue.400">
            PR {prNumber}
          </Link>
        </Text>
        <Divider />
      </div>
      <SimpleGrid minChildWidth="250px" spacing="6" pt="8">
        {machineFiles.map((machine) => (
          <chakra.div position="relative" key={machine.filename}>
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
                  {machine.filename.split('-').join(' ')}
                </Text>
                <ButtonGroup size="xs" ml="auto" variant="ghost" spacing="1">
                  <IconButton
                    as={Link}
                    target="_blank"
                    href={machine.blob_url}
                    icon={<FaGithub />}
                    aria-label="Open in github"
                  />
                  <Tooltip
                    hasArrow
                    label={`Visualize ${machine.filename
                      .split('-')
                      .join(' ')} machine`}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <IconButton
                      variant="solid"
                      colorScheme="purple"
                      as={Link}
                      href={`/${prNumber}/${machine.filename}`}
                      icon={<SiDgraph />}
                      aria-label="Visualize"
                    />
                  </Tooltip>
                </ButtonGroup>
              </Flex>
              <Flex>
                {machine.additions !== 0 && (
                  <Stat>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {machine.additions} additions
                    </StatHelpText>
                  </Stat>
                )}
                {machine.deletions !== 0 && (
                  <Stat>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      {machine.deletions} deletions
                    </StatHelpText>
                  </Stat>
                )}
              </Flex>
            </Flex>
            {machine.status === 'added' && (
              <chakra.span
                pos="absolute"
                top="-1px"
                right="-1px"
                px={2}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                lineHeight="none"
                color="green.100"
                transform="translate(50%,-50%)"
                bg="green.600"
                rounded="full"
              >
                new
              </chakra.span>
            )}
          </chakra.div>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prNumber = context.params?.pr;

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
      const machineOutputs = prFiles
        .filter((file) => file.filename.startsWith('.xstate/'))
        .map((machine) => {
          const comp = pick(machine, [
            'additions',
            'blob_url',
            'changes',
            'deletions',
            'filename',
            'status',
          ]);
          return {
            ...comp,
            filename: comp.filename.split('/')[1].split('.')[0],
          };
        });
      return machineOutputs;
    } catch (err) {
      return false;
    }
  }

  const machineFiles = await getData();

  return {
    props: { prNumber, machineFiles },
  };
};
