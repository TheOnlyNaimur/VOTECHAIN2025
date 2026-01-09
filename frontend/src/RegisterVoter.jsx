import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  User,
  Mail,
  Phone,
  Fingerprint,
  CheckCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function RegisterVoter() {
  const { address } = useAccount();
  const [myStatus, setMyStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nid: "",
  });

  // Check status on mount and when localStorage updates
  useEffect(() => {
    const checkStatus = () => {
      const existing = JSON.parse(
        localStorage.getItem("voter_requests") || "[]"
      );
      const myRequest = existing.find((r) => r.userAddress === address);
      setMyStatus(myRequest || null);
    };

    checkStatus();
    window.addEventListener("voter_requests_updated", checkStatus);
    return () =>
      window.removeEventListener("voter_requests_updated", checkStatus);
  }, [address]);

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
  };

  // Show status if already submitted
  if (myStatus) {
    if (myStatus.status === "pending") {
      return (
        <div className="text-center p-10 bg-yellow-50 rounded-[3rem] border border-yellow-200">
          <Clock size={64} className="mx-auto text-yellow-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Application Pending
          </h2>
          <p className="text-gray-500 mt-3 font-medium">
            Wait for the Authority to verify and register you on the blockchain.
          </p>
        </div>
      );
    }

    if (myStatus.status === "approved") {
      return (
        <div className="text-center p-10 bg-emerald-50 rounded-[3rem] border border-emerald-200">
          <CheckCircle2 size={64} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Voter Approved! ✅
          </h2>
          <p className="text-gray-600 mt-3">
            You are now registered on the blockchain as a voter.
          </p>
          <p className="text-emerald-600 font-bold mt-4">
            You can now cast your vote!
          </p>
        </div>
      );
    }

    if (myStatus.status === "rejected") {
      return (
        <div className="text-center p-10 bg-red-50 rounded-[3rem] border border-red-200">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            Registration Rejected
          </h2>
          <p className="text-gray-600 mt-3">
            Your voter registration was not approved.
          </p>
          <button
            onClick={() => {
              const existing = JSON.parse(
                localStorage.getItem("voter_requests") || "[]"
              );
              const filtered = existing.filter(
                (r) => r.userAddress !== address
              );
              localStorage.setItem("voter_requests", JSON.stringify(filtered));
              window.dispatchEvent(new Event("voter_requests_updated"));
            }}
            className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700"
          >
            Reapply
          </button>
        </div>
      );
    }
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
