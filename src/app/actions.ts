"use server";

import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return redirect("/login");
    }

    await lucia.invalidateSession(sessionId);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
    return redirect("/login");
}
