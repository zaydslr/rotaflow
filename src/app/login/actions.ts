"use server";

import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || !email.includes("@")) {
        return { error: "Invalid email" };
    }
    if (typeof password !== "string" || password.length < 6) {
        return { error: "Invalid password" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!existingUser) {
        return { error: "Incorrect email or password" };
    }

    const validPassword = await new Argon2id().verify(existingUser.passwordHash, password);

    if (!validPassword) {
        return { error: "Incorrect email or password" };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    return redirect("/");
}
