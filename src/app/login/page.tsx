import { login } from "./actions";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Sign in to Rotaflow
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        Welcome back to your ward management portal
                    </p>
                </div>
                <form action={login} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <a href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                            Don't have an account? Create one
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
