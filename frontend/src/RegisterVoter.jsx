import { useState } from "react";
import { useAccount } from "wagmi";
import { User, Mail, Phone, Fingerprint, CheckCircle } from "lucide-react";

export function RegisterVoter() {
  const { address } = useAccount();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nid: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    // Validate form is filled
    if (!formData.name || !formData.email || !formData.phone || !formData.nid) {
      alert("Please fill all fields");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("voter_requests") || "[]");
    const existingEntry = existing.find((r) => r.userAddress === address);

    if (existingEntry && existingEntry.status !== "rejected") {
      alert(
        `Registration already submitted for this wallet. Status: ${existingEntry.status}`
      );
      return;
    }

    // Just save to localStorage - NO blockchain call
    // Admin will register on blockchain when approving
    const newRequest = {
      ...formData,
      userAddress: address,
      status: "pending",
      timestamp: new Date().toLocaleString(),
    };

    const filtered = existing.filter((r) => r.userAddress !== address);
    localStorage.setItem(
      "voter_requests",
      JSON.stringify([...filtered, newRequest])
    );
    console.log(
      "✅ Voter application saved locally! Admin will register on blockchain.",
      newRequest
    );
    window.dispatchEvent(new Event("voter_requests_updated"));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 animate-in zoom-in-95">
        <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 leading-none">
          Submission Success!
        </h2>
        <p className="text-gray-500 mt-3 font-medium">
          Wait for the Authority to verify and register you on the blockchain.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
      <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">
        Voter Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
            Legal Name
          </label>
          <input
            required
            className="w-full bg-gray-50 border p-4 rounded-2xl"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
              Email
            </label>
            <input
              required
              type="email"
              className="w-full bg-gray-50 border p-4 rounded-2xl"
              placeholder="email@gov.bd"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
              Phone
            </label>
            <input
              required
              className="w-full bg-gray-50 border p-4 rounded-2xl"
              placeholder="+880..."
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
            National ID
          </label>
          <input
            required
            className="w-full bg-gray-50 border p-4 rounded-2xl"
            placeholder="10-digit NID"
            value={formData.nid}
            onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
        >
          <CheckCircle size={20} />
          Apply for Verification
        </button>
      </form>
    </div>
  );
}
