import Page from './component';
import env from '@/lib/env';

export default function SignupPage() {
    return (
        <Page turnstileKey={env.CF_TURNSTILE_KEY} />
    );
}