import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { theme } from '../theme';
import siteConfig from '../site.config';

const MyApp = ({ pageProps, Component }: AppProps) => {
  return (
    <ChakraProvider theme={theme}>
      <DefaultSeo {...siteConfig.seo} />
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default MyApp;
