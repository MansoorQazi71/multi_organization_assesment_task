import { useForm } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function Edit({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name ?? "",
        email: user.email ?? "",
        password: "",
        password_confirmation: "",
        global_role: user.role ?? "member",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("users.update", user.id)); // or `/users/${user.id}`
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <form onSubmit={submit} className="p-6 space-y-3 max-w-md">
                <h1 className="text-2xl font-semibold mb-2">Edit User</h1>

                <input
                    className="w-full border p-2"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                <input
                    type="email"
                    className="w-full border p-2"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                />
                <input
                    type="password"
                    className="w-full border p-2"
                    placeholder="New Password (optional)"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                />
                <input
                    type="password"
                    className="w-full border p-2"
                    placeholder="Confirm Password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                />
                <select
                    className="w-full border p-2"
                    value={data.global_role}
                    onChange={(e) => setData("global_role", e.target.value)}
                >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    disabled={processing}
                    className="px-3 py-2 bg-black text-white rounded"
                >
                    {processing ? "Updating…" : "Update"}
                </button>

                {/* optional error rendering */}
                {errors?.email && (
                    <div className="text-red-600 text-sm">{errors.email}</div>
                )}
            </form>
        </div>
    );
}
