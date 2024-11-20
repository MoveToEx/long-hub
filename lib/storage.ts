import env from './env';
import local from './storage-provider/local';
import r2 from './storage-provider/r2';

interface Provider {
    create: (name: string, buffer: Buffer, options: {
        ContentType: string;
    }) => Promise<string>;
    remove: (name: string) => Promise<void>;
};

let provider: Provider;

if (env.STORAGE_PROVIDER == 'local') {
    provider = new local(env);
}
else {
    provider = new r2(env);
}

export default provider;