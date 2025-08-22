import NavBar from "@/Components/NavBar";

export default function Index({ users }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <a
                        href="/users/create"
                        className="px-3 py-2 bg-black text-white rounded"
                    >
                        Create
                    </a>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t">
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.roles?.[0]?.name ?? "member"}</td>
                                <td className="text-right space-x-2">
                                    <a
                                        href={`/users/${u.id}/edit`}
                                        className="px-2 py-1 border rounded"
                                    >
                                        Edit
                                    </a>
                                    <form
                                        method="post"
                                        action={`/users/${u.id}`}
                                        className="inline"
                                    >
                                        <input
                                            type="hidden"
                                            name="_method"
                                            value="delete"
                                        />
                                        <button className="px-2 py-1 border rounded text-red-600">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
