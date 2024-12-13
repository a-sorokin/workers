const createWorkerObject = <T>(calcFunc: T): Worker => {
  const onMessageStr = `onmessage = (event) => postMessage(${calcFunc}(...event.data.args))`;
  const workerBlob = new Blob([onMessageStr], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(workerBlob));
};

export const createWorker = <T>(calcFunc: T) => {
  const worker = createWorkerObject(calcFunc);

  const setOnMessage = (onMessage: (e: MessageEvent<unknown>) => void) => {
    worker.onmessage = (e) => onMessage(e.data);
  };

  const postMessage = function (...args: unknown[]) {
    worker.postMessage({ args });
  };

  const calculate = function (...args: unknown[]) {
    return new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage({ args });
    });
  };

  const terminate = () => worker.terminate();

  return { worker, setOnMessage, postMessage, calculate, terminate };
};
