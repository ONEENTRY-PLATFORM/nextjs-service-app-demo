'use client';

import { useGSAP } from '@gsap/react';
import { useTransitionState } from 'next-transition-router';
import { useState } from 'react';

/**
 * useStage
 * @returns {{ stage: string; stageData: { stage: string; prevStage: string } }} global stage data
 */
const useStage = (): {
  stage: string;
  stageData: { stage: string; prevStage: string };
} => {
  const { stage } = useTransitionState();

  const [state, setState] = useState<string>('none');
  const [prevStage, setPrevStage] = useState<string>('');

  useGSAP(() => {
    /** first loading */
    if (stage === 'none' && prevStage === '') {
      setState('play');
    }
    // enter stage
    else if (stage === 'entering' && prevStage === 'leaving') {
      setState('enter');
    }
    // leaving stage
    else if (stage === 'leaving' && prevStage === 'none') {
      setState('leave');
    }

    setPrevStage(stage);
  }, [stage]);

  return {
    stage: state,
    stageData: {
      stage: stage,
      prevStage: prevStage,
    },
  };
};

export default useStage;
