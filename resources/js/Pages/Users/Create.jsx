// resources/js/Pages/Users/Create.jsx
import { useForm } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        global_role: "member",
    });

    function submit(e) {
        e.preventDefault();
        post(route("users.store")); // uses XSRF cookie/header automatically
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <form onSubmit={submit} className="p-6 space-y-3 max-w-md">
                <h1 className="text-2xl font-semibold mb-2">Create User</h1>

                <input
                    className="w-full border p-2"
                    placeholder="Name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                    <div className="text-red-600 text-sm">{errors.name}</div>
                )}

                <input
                    type="email"
                    className="w-full border p-2"
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                />
                {errors.email && (
                    <div className="text-red-600 text-sm">{errors.email}</div>
                )}

                <input
                    type="password"
                    className="w-full border p-2"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                />
                {errors.password && (
                    <div className="text-red-600 text-sm">
                        {errors.password}
                    </div>
                )}

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
                {errors.global_role && (
                    <div className="text-red-600 text-sm">
                        {errors.global_role}
                    </div>
                )}

                <button
                    disabled={processing}
                    className="px-3 py-2 bg-black text-white rounded"
                >
                    {processing ? "Saving…" : "Save"}
                </button>
            </form>
        </div>
    );
}
