import { CSSObject, keyframes } from '@chakra-ui/react';

const baseStyles: CSSObject = {
  //? Base
  '[data-viz-theme]': {
    background: 'var(--viz-color-bg)',
    color: 'var(--viz-color-fg)',

    "&[data-viz-theme='light']": {
      '--viz-color-bg': '#fff',
      '--viz-color-fg': '#111',
      '--viz-node-color-bg': '#ddd',
      '--viz-edge-color': '#111',
    },

    "&[data-viz-theme='dark']": {
      '--viz-color-fg': '#fff',
      '--viz-color-bg': '#111',
      '--viz-node-color-bg': '#2d2d2d',
      '--viz-edge-color': 'white',
    },

    '--viz-color-transparent': '#fff6',
    '--viz-color-active': '#679ae7',
    '--viz-border-color': 'var(--viz-node-color-bg)',
    '--viz-border-width': '2px',
    '--viz-border': 'var(--viz-border-width) solid var(--viz-border-color)',
    '--viz-radius': '0.25rem',
    '--viz-node-border-style': 'solid',
    '--viz-node-parallel-border-style': 'dashed',
    '--viz-font-size-base': '14px',
    '--viz-font-size-sm': '12px',
  },
};

const actionVizStyles: CSSObject = {
  //? Action Viz
  "[data-viz='action']": {
    color: 'var(--viz-color-fg)',
    display: 'flex',
    flexDirection: 'row',
    gap: '1ch',
    alignItems: 'baseline',
    justifyContent: 'flex-start',

    '&[data-viz-action]': {
      '&:before': {
        content: "attr(data-viz-action) ' / '",
        fontSize: 'var(--viz-font-size-sm)',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        opacity: 0.5,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      },
    },
  },

  "[data-viz='action-type']": {
    fontSize: 'xs',
    maxWidth: '15ch',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
};

const delayProgress = keyframes`
    from {
        stroke-dashoffset: 1;
    }
    to {
        stroke-dashoffset: 0;
    }
`;

const delayVizStyles: CSSObject = {
  //? Delay viz

  "[data-viz='delay']": {
    opacity: 0.5,
    transition: 'opacity 0.3s ease',

    "> [data-viz='delay-circle'], > [data-viz='delay-fill']": {
      transition: 'opacity 0.3s ease',
      strokeWidth: '20',
    },

    '&[data-viz-active]': {
      opacity: 1,
      "> [data-viz='delay-fill']": {
        animation: `${delayProgress} calc(var(--delay, 0) * 1ms) both linear`,
      },
    },
  },

  "[data-viz='delay-circle']": {
    opacity: 0.4,
  },
};

const edgeVizStyles: CSSObject = {
  //? Edge viz
  "[data-viz='edgeGroup']": {
    '&:not([data-viz-active])': {
      opacity: 0.25,
    },
  },

  "[data-viz='edge']": {
    stroke: 'var(--viz-edge-color)',
  },

  "[data-viz='edge-arrow'], [data-viz='initialEdge-circle']": {
    fill: 'var(--viz-edge-color)',
  },
};

const eventTypeVizStyles: CSSObject = {
  //? Event type viz
  "[data-viz='eventType']": {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '1ch',
    '--viz-eventType-dot-color': 'transparent',

    "&[data-viz-keyword='done']": {
      '--viz-eventType-dot-color': '#33ff99',
    },
    "&[data-viz-keyword='error']": {
      '--viz-eventType-dot-color': '#e76f4b',
    },
    "&[data-viz-keyword='always'], &[data-viz-keyword='after']": {
      '--viz-eventType-dot-color': '#fff',
    },

    '&[data-viz-keyword]:before': {
      content: "''",
      height: '0.5rem',
      width: '0.5rem',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--viz-eventType-dot-color)',
      display: 'block',
    },
  },
};

const invokeVizStyles: CSSObject = {
  //? Invoke viz
  "[data-viz='invoke']": {
    '&:before': {
      content: "'invoke /'",
      fontSize: 'var(--viz-font-size-sm)',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
  },
};

const stateNodeVizStyles: CSSObject = {
  //? State node viz
  "[data-viz='stateNodeGroup']": {
    '--viz-node-border-color': 'var(--viz-border-color)',
    '--viz-node-active': '0',
    '--viz-transition-color': '#555',
    '&[data-viz-active]': {
      '--viz-node-border-color': 'var(--viz-color-active)',
      '--viz-node-active': '1',
      '--viz-transition-color': 'var(--viz-color-active)',
    },
    '&[data-viz-previewed]:not([data-viz-active])': {
      '--viz-node-border-color': 'var(--viz-color-active)',
    },
  },

  "[data-viz='stateNode']": {
    color: 'var(--viz-color-fg)',
    alignSelf: 'start',
    opacity:
      'calc(0.7 * (1 - var(--viz-node-active)) + var(--viz-node-active))',
    fontSize: '1em',
    borderRadius: 'var(--viz-radius)',
    overflow: 'hidden',
    // Border in a pseudoelement to not affect positioning
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: 'var(--viz-border)',
      borderColor: 'var(--viz-node-border-color)',
      borderStyle: 'var(--viz-node-border-style)',
      borderRadius: 'inherit',
      zIndex: '1',
      pointerEvents: 'none',
    },
    "&[data-viz-parent-type='parallel']": {
      '--viz-node-border-style': 'var(--viz-node-parallel-border-style)',
    },
    "&:not([data-viz-parent-type='parallel'])": {
      '--viz-node-border-style': 'solid',
    },
  },
  "[data-viz='stateNode-header']": {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateAreas: '"type key tags"',
    alignItems: 'center',
    "> [data-viz='stateNode-key']": {
      gridArea: 'key',
    },
    "> [data-viz='stateNode-tags']": {
      gridArea: 'tags',
    },
  },
  "[data-viz='stateNode-content']": {
    background: 'var(--viz-node-color-bg)',
    '&:empty': {
      display: 'none',
    },
  },

  "[data-viz='stateNode-states']": {
    padding: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    position: 'absolute',
    top: '0',
    left: '0',
    '&:empty': {
      display: 'none',
    },
  },
  "[data-viz='stateNode-type']": {
    height: '1.5rem',
    width: '1.5rem',
    margin: '0.5rem',
    mr: '0',
    borderRadius: 'var(--viz-radius)',
    background: 'var(--viz-color-transparent)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&::before': {
      content: "'var(--viz-stateNode-type)'",
      display: 'block',
      fontWeight: 'bold',
    },
    "&[data-viz-type='final']": {
      border: '2px solid var(--viz-color-transparent)',
      background: 'transparent',
      '&:before': {
        content: "''",
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        transform: 'scale(0.7)',
        background: 'var(--viz-color-transparent)',
      },
    },
    "&[data-viz-type='history']": {
      '--viz-stateNode-type': 'H',
      "&[data-viz-history='deep']": {
        '--viz-stateNode-type': 'H٭',
        fontSize: '80%',
      },
    },
  },
  "[data-viz='stateNode-key']": {
    padding: '0.5rem',
    fontWeight: 'bold',
  },
  "[data-viz='stateNode-keyText']": {
    maxWidth: '20ch',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  "[data-viz='stateNode-actions']": {
    padding: '0.5rem',
    '&:empty': {
      display: 'none',
    },
  },
  "[data-viz='stateNode-invocations']": {
    padding: '0.5rem',
  },
  "[data-viz='stateNode-tags']": {
    display: 'flex',
    flexDirection: 'row',
    textOverflow: 'ellipsis',
    padding: '0.5rem',
  },
  "[data-viz='stateNode-tag']": {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    backgroundColor: '#fff5',
    "& + [data-viz='stateNode-tag']": {
      marginLeft: '1ch',
    },
  },
  "[data-viz='stateNode-meta']": {
    borderTop: '2px solid var(--chakra-colors-whiteAlpha-300)',
    padding: '0.5rem',
    minWidth: 'max-content',
    fontSize: 'var(--chakra-fontSizes-sm)',
    '> p': {
      maxWidth: '10rem',
    },
  },
};

const moveLeft = keyframes`
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
`;

const transitionVizStyles: CSSObject = {
  //? Transition viz

  "[data-viz='transition']": {
    '--viz-transition-color': 'gray',
    display: 'block',
    borderRadius: '1rem',
    backgroundColor: 'var(--viz-transition-color)',
    appearance: 'none',

    '&[data-viz-potential]': {
      ' --viz-transition-color': 'var(--viz-color-active)',
    },

    "> [data-viz='transition-label']": {
      alignSelf: 'center',
    },

    '&[data-is-delayed]': {
      '&:not([data-viz-disabled]):after': {
        animation: `${moveLeft} calc(var(--delay) * 1ms) linear`,
        zIndex: 0,
      },
    },
  },

  "[data-viz='transition-label']": {
    flexShrink: 0,
    fontSize: 'var(--viz-font-size-sm)',
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },

  "[data-viz='transition-event']": {
    display: 'flex',
    flexDirection: 'row',
    alignItems: ' enter',
    gap: '1ch',
    padding: '0.25rem 0.5rem',
  },

  "[data-viz='transition-guard']": {
    padding: '0 0.5rem',
    '&:before': {
      content: "'['",
    },
    '&:after': {
      content: "']'",
    },
    '.operator, .bracket': {
      fontFamily: 'monospace',
    },
    '.operator': {
      color: 'blue.200',
    },
    '.bracket': {
      color: 'orange.200',
    },
  },

  "[data-viz='transition-actions']": {
    '&:empty': {
      display: 'none',
    },
  },

  "[data-viz='transition-content']": {
    '&:empty': {
      display: 'none',
    },
    padding: '0rem 0.5rem 0.5rem',
  },

  "[data-viz='transition-description']": {
    '&:empty': {
      display: 'none',
    },
    borderTop: '2px solid var(--chakra-colors-whiteAlpha-300)',
    padding: '0.5rem',
    minWidth: 'max-content',
    fontSize: 'sm',
    textAlign: 'left',
    '> p': {
      maxWidth: '10rem',
    },
  },
};

export const styles: CSSObject = {
  ...baseStyles,
  ...actionVizStyles,
  ...delayVizStyles,
  ...invokeVizStyles,
  ...edgeVizStyles,
  ...eventTypeVizStyles,
  ...stateNodeVizStyles,
  ...transitionVizStyles,
};
