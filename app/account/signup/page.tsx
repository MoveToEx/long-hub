import Page from './component';


export default function SignupPage() {
    const turnstileKey = process.env['CF_TURNSTILE_KEY'] as string | undefined;
    
    return (
        <Page turnstileKey={turnstileKey} />
    );
}