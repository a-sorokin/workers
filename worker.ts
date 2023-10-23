type TCalcFunc = (...args: unknown[]) => unknown;
type TPostMessage = (...args: unknown[]) => void;
type TOnMessage = (e: MessageEvent<unknown>) => void;
type TCalculate = (...args: unknown[]) => Promise<unknown>;

const createWorkerObject = (calcFunc: TCalcFunc): Worker => {
  const onMessageStr = `onmessage = (event) => postMessage(${calcFunc}(...event.data.args))`;
  const workerBlob = new Blob([onMessageStr], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(workerBlob));
};

export const createWorker = (calcFunc: TCalcFunc) => {
  const worker = createWorkerObject(calcFunc);

  const setOnMessage = (onMessage: TOnMessage) => {
    worker.onmessage = (e) => onMessage(e.data);
  };

  const postMessage: TPostMessage = function () {
    worker.postMessage({ args: [...arguments] });
  };

  const calculate: TCalculate = function () {
    return new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage({ args: [...arguments] });
    });
  };

  const terminate = () => worker.terminate();

  return { worker, setOnMessage, postMessage, calculate, terminate };
};
