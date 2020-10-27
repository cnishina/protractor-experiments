
async function waitFunction(waitMilliseconds: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, waitMilliseconds);
  });
}

async function timeout(timeoutMilliseconds: number) {
  return new Promise((_, reject) => {
    setTimeout(reject, timeoutMilliseconds);
  });
}

async function raceToWait(
    waitMilliseconds: number, timeoutMilliseconds: number) {
  await Promise.race([
    waitFunction(waitMilliseconds), timeout(timeoutMilliseconds)]);
}

async function test1() {
  // resolves because the wait < than the timeout (100 < 1000).
  let startWaitResolve = Date.now();
  try {
    await raceToWait(100, 1000);
    console.log('Expected resolve');
  } catch (e) {
    console.log('Error: should not get here.');
  }
  let endWaitResolve = Date.now();
  console.log(
    `Resolve timeout ${endWaitResolve - startWaitResolve} milliseconds`);

  // rejects because the wait > than the timeout (1000, 100);
  let startWaitReject = Date.now();
  try {
    await raceToWait(1000, 100);
  } catch (e) {
    console.log('Expected reject');
  }
  let endWaitReject = Date.now();
  console.log(
    `Reject timeout ${endWaitReject - startWaitReject} milliseconds`);
}

// test1();


/**
 * Resolves when the condition resolves to truthy. Rejects when the timeout
 * completes first.
 * @param condition 
 * @param timeoutMilliseconds 
 */
async function wait(
    condition: Promise<boolean>|boolean,
    timeoutMilliseconds: number) {
  let resolveCondition = new Promise(async (resolve, reject) => {
    let conditionMet = false;
    let remainderTime = timeoutMilliseconds;
    while(!conditionMet) {
      let start = Date.now();
      conditionMet = await condition;
      if (conditionMet) {
        resolve();
        return;
      }
      let end = Date.now();
      let duration = end - start;
      remainderTime = remainderTime - 100 - duration;
      let remainder = 100 - duration;
      if (remainder > 0) {
        console.log(`We did not return and slept for ${remainder}`);
        await new Promise(resolve2 => {
          setTimeout(resolve2, remainder);
        });
      }
      if (remainderTime < 0) {
        reject();
        return;
      }
    }
  });
  let rejectTimeout = new Promise((_, reject) => {
    setTimeout(reject, timeoutMilliseconds);
  });
  await Promise.race([resolveCondition, rejectTimeout]);
}

async function test2() {
  // let startWaitResolve = Date.now();
  // try {
  //   await wait(waitFunction(100), 1000);
  //   console.log('Expected resolve');
  // } catch (e) {
  //   console.log('Error: should not get here.');
  // }
  // let endWaitResolve   = Date.now();
  // console.log(
  //   `Resolve timeout ${endWaitResolve - startWaitResolve} milliseconds`);

  // rejects because the wait > than the timeout (1000, 100);
  let startWaitReject = Date.now();
  try {
    await wait(false, 1000);
  } catch (e) {
    console.log('Expected reject');
  }
  let endWaitReject = Date.now();
  console.log(
    `Reject timeout ${endWaitReject - startWaitReject} milliseconds`);
}

test2();