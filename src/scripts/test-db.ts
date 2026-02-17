import { prisma } from "../lib/prisma";

async function main() {
    try {
        console.log("Testing database connection...");
        const workspaceCount = await prisma.workspace.count();
        console.log(`Connection successful. Found ${workspaceCount} workspaces.`);
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
