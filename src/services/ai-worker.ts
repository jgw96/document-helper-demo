// @ts-ignore
import { QuestionAnsweringPipeline, pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

let answerer: QuestionAnsweringPipeline | undefined = undefined;

self.onmessage = async (e) => {
    if (e.data.type === 'getAnswer') {
        return new Promise((resolve) => {
            getAnswer(e.data.question, e.data.context).then((answer) => {
                self.postMessage({
                    type: 'answer',
                    answer: answer.answer,
                });
                resolve(answer.answer);
            })
        })
    }
    else if (e.data.type === "load") {
        await loadAnswerer();
        return Promise.resolve();
    }
    else {
        return Promise.reject('Unknown message type');
    }
}

export async function loadAnswerer(): Promise<void> {
    return new Promise(async (resolve) => {
        if (!answerer) {
            try {
                answerer = await pipeline('question-answering');
                console.log("answerer loaded", answerer)
            }
            catch (err) {
                console.error("err", err);
            }

            resolve();
        }
        else {
            resolve();
        }
    })
}

export async function getAnswer(question: string, context: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        await loadAnswerer();

        if (answerer) {
            // @ts-ignore
            const output = await answerer(question, context);

            resolve(output);
        }
        else {
            reject("No answerer loaded");
        }
    })
}
