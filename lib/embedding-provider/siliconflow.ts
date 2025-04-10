import 'server-only';
import env from '@/lib/env';

export default class SiliconFlowProvider {
    MODEL = 'BAAI/bge-m3';
    ENDPOINT = 'https://api.siliconflow.cn/v1';

    async get_text_embedding(text: string[]): Promise<number[][]> {
        const response = await fetch(this.ENDPOINT + '/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + env.SILICONFLOW_API_KEY
            },
            body: JSON.stringify({
                model: this.MODEL,
                input: text,
                encoding_format: 'float'
            })
        });

        if (response.status != 200) {
            throw new Error(`Unable to convert to embedding(${response.status}): ${await response.text()}`);
        }

        const data = await response.json();

        return data['data'].toSorted((val: any) => val['index']).map((val: any) => val['embedding']);
    }
}