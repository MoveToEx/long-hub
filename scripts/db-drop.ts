import { seq } from "@/lib/db";
import { config } from 'dotenv';

config({
    path: '.env.local'
});

(async () => {
    await seq.sync({ force: true });
})();
