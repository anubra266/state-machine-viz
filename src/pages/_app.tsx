import type { AppProps } from 'next/app';

const MyApp = ({ pageProps, Component }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
