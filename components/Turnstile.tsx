import dynamic from 'next/dynamic';
import Script from "next/script";


const _Turnstile = ({ clientKey }: { clientKey: string }) => {
    return (
        <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={clientKey} />
        </>
    );
}

const Turnstile = dynamic(
    () => Promise.resolve(_Turnstile),
    {
        ssr: false
    }
);

export default Turnstile;