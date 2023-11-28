import { seq } from "@/lib/db";

(async () => {
    await seq.sync({ force: true });
})();
