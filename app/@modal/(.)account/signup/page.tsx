import Signup from '@/app/account/signup/page';
import SignupModal from './components';


export default function SignupModal_() {
    return (
        <SignupModal signUpSlot={<Signup />} />
    )
}