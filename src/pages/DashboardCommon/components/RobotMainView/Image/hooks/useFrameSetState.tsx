import { useRef, useState, useEffect } from 'react';
import raf from 'rc-util/lib/raf';

type SetActionType<T> = Partial<T> | ((state: T) => Partial<T>);

export default function useFrameSetState<T extends object>(initial: T) {
  const frame = useRef<any>(null);
  const [state, setState] = useState(initial);

  const queue = useRef<SetActionType<T>[]>([]);

  const setFrameState = (newState: SetActionType<T>) => {
    if (frame.current === null) {
      queue.current = [];
      frame.current = raf(() => {
        setState((preState) => {
          let memoState: any = preState;
          queue.current.forEach((queueState) => {
            memoState = { ...memoState, ...queueState };
          });
          frame.current = null;

          return memoState;
        });
      });
    }

    queue.current.push(newState);
  };

  useEffect(() => () => frame.current && raf.cancel(frame.current), []);

  return [state, setFrameState] as const;
}
