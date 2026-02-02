import { app } from "./app";
import { prisma } from "./db/prisma";

const PORT = process.env.PORT || 3002;
prisma.$connect().then(() => {
    app.listen(PORT, () => {
        console.log(`API running on port ${PORT}`);
    });
});
