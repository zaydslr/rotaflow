"use server";

import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateIdFromEntropySize } from "lucia";
import { UserRole } from "@prisma/client";

export async function signup(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const workspaceName = formData.get("workspaceName");

    if (
        typeof email !== "string" ||
        email.length < 3 ||
        email.length > 255 ||
        !email.includes("@")
    ) {
        return { error: "Invalid email" };
    }
    if (
        typeof password !== "string" ||
        password.length < 6 ||
        password.length > 255
    ) {
        return { error: "Password must be at least 6 characters" };
    }
    if (typeof workspaceName !== "string" || workspaceName.length < 2) {
        return { error: "Workspace name is too short" };
    }

    const argon2id = new Argon2id();
    const passwordHash = await argon2id.hash(password);

    try {
        // 1. Create Workspace
        // 2. Create User as MANAGER
        // 3. Create Session

        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    settings: {
                        create: {} // Default settings
                    }
                }
            });

            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role: UserRole.MANAGER,
                    workspaceId: workspace.id,
                }
            });

            return user;
        });

        const session = await lucia.createSession(result.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
    } catch (e) {
        console.error(e);
        return { error: "Email already exists or database error" };
    }

    return redirect("/");
}
