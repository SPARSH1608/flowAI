import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const images = await prisma.image.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
    console.log(JSON.stringify(images, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
