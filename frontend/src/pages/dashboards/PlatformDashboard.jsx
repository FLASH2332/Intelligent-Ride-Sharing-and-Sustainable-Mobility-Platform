import { useState } from "react";
import { Building2, UserPlus, Shield } from "lucide-react";

const PlatformDashboard = () => {
  const [orgData, setOrgData] = useState({
    name: "",
    orgCode: "",
  });

  const [adminData, setAdminData] = useState({
    email: "",
    phone: "",
    password: "",
    organizationId: "",
  });

  const handleCreateOrg = async () => {
    try {
      const res = await fetch("http://localhost:5000/platform/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(orgData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Organization created successfully");
      setOrgData({ name: "", orgCode: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateOrgAdmin = async () => {
    try {
      const res = await fetch("http://localhost:5000/platform/org-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(adminData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Org Admin created successfully");
      setAdminData({
        email: "",
        phone: "",
        password: "",
        organizationId: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-stone-900">
          Platform Admin Dashboard
        </h1>
      </div>

      {/* Create Organization */}
      <section className="bg-white border rounded-xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Create Organization</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Organization Name"
            value={orgData.name}
            onChange={(e) =>
              setOrgData({ ...orgData, name: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Org Code (e.g. ORG-AMRITA-001)"
            value={orgData.orgCode}
            onChange={(e) =>
              setOrgData({ ...orgData, orgCode: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleCreateOrg}
          className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Create Organization
        </button>
      </section>

      {/* Create Org Admin */}
      <section className="bg-white border rounded-xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Create Org Admin</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Admin Email"
            value={adminData.email}
            onChange={(e) =>
              setAdminData({ ...adminData, email: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Phone"
            value={adminData.phone}
            onChange={(e) =>
              setAdminData({ ...adminData, phone: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Temporary Password"
            value={adminData.password}
            onChange={(e) =>
              setAdminData({ ...adminData, password: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Organization ID"
            value={adminData.organizationId}
            onChange={(e) =>
              setAdminData({
                ...adminData,
                organizationId: e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={handleCreateOrgAdmin}
          className="mt-4 px-5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800"
        >
          Create Org Admin
        </button>
      </section>
    </div>
  );
};

export default PlatformDashboard;
