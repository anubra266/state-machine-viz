import { createStandaloneToast, UseToastOptions } from '@chakra-ui/react';
import { createModel } from 'xstate/lib/model';

const toast = createStandaloneToast();

export const notifModel = createModel(
  {},
  {
    events: {
      BROADCAST: (
        message: string,
        status: UseToastOptions['status'],
        title?: string,
      ) => ({
        message,
        status,
        title,
      }),
    },
  },
);
export const notifMachine = notifModel.createMachine({
  initial: 'running',
  context: {},
  on: {
    BROADCAST: {
      actions: [
        (_, e) => {
          const id = e.message;
          if (!toast.isActive(id)) {
            toast({
              id,
              status: e.status,
              title: e.title || e.status?.toUpperCase(),
              description: id,
              isClosable: true,
              position: 'bottom-left',
            });
            // toast({
            //   id,
            //   status: 'info',
            //   title: 'Visualizer events',
            //   description:
            //     "Those dont't work for now, we're just aiming to show an overall picture of the machine.",
            //   isClosable: true,
            //   position: 'top-left',
            // });
          }
        },
      ],
    },
  },
  states: {
    running: {},
  },
});
