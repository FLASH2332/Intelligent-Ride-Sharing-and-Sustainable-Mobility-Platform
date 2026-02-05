const PlatformDashboard = () => {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Platform Admin</h1>
  
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create Organization</h2>
  
          <p className="text-sm text-stone-600 mb-4">
            Register a new organization on GreenCommute.
          </p>
  
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
            + Add Organization
          </button>
        </section>
  
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create Org Admin</h2>
          <p className="text-sm text-stone-600 mb-4">
            Assign an administrator to manage employees.
          </p>
  
          <button className="px-4 py-2 bg-stone-800 text-white rounded-lg">
            + Add Org Admin
          </button>
        </section>
      </div>
    );
  };
  
  export default PlatformDashboard;
  