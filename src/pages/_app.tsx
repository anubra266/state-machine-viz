import type { AppProps } from 'next/app';
import '../ActionViz.scss';
import '../base.scss';
import '../DelayViz.scss';
import '../EdgeViz.scss';
import '../EventTypeViz.scss';
import '../InvokeViz.scss';
import '../StateNodeViz.scss';
import '../TransitionViz.scss';

const MyApp = ({ pageProps, Component }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
