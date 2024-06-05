let answererWorker: Worker;

// @ts-ignore
import AnswererWorker from './ai-worker?worker'

export async function loadAnswerer(): Promise<void> {
    answererWorker = new AnswererWorker();
    answererWorker.postMessage({
        type: "load"
    });
}

export function getAnswer(question: string, context: string): Promise<any> {
    return new Promise((resolve) => {
        answererWorker.onmessage = async (e) => {
            if (e.data.type === "answer") {
                resolve(e.data);
            }
            else {
                resolve("")
            }
        }

        answererWorker.postMessage({
            type: "getAnswer",
            question,
            context
        })
    })
}