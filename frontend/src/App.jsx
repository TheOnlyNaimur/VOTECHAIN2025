import { useState, useMemo, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { VotingBallot } from "./VotingBallot";
import {
  Wallet,
  User,
  Flag,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Vote,
  LogOut,
} from "lucide-react";

// Components
import { RegisterVoter } from "./RegisterVoter";
import { RegisterParty } from "./RegisterParty";
import { AdminPanel } from "./AdminPanel";
import { Results } from "./Results";

// Import your static constants
import { ADMIN_ADDRESS } from "./constants";
import { VoterQueue } from "./VoterQueue";

function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [view, setView] = useState("portal");
  const [refreshKey, setRefreshKey] = useState(0);

  // INSTANT CHECK: Compares connected wallet to the constant in constants.js
  const isAdmin =
    isConnected && address && ADMIN_ADDRESS
      ? address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
      : false;

  // Auto-redirect admin to admin panel on connect
  useEffect(() => {
    if (isAdmin && view === "portal") {
      setView("admin");
    }
  }, [isAdmin, view]);

  // Check status - refreshKey forces recalculation when "Tap to Check" is clicked
  const { myStatus, myPartyStatus, myPartyRequest } = useMemo(() => {
    const voterRequests = JSON.parse(
      localStorage.getItem("voter_requests") || "[]"
    );
    const myRequest = voterRequests.find((r) => r.userAddress === address);

    const partyRequests = JSON.parse(
      localStorage.getItem("party_requests") || "[]"
    );
    const myPartyReq = partyRequests.find((r) => r.userAddress === address);

    return {
      myStatus: myRequest ? myRequest.status : "new",
      myPartyStatus: myPartyReq ? myPartyReq.status : "new",
      myPartyRequest: myPartyReq,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshKey]);

  // 1. LANDING PAGE (Not Connected)
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
        <div className="bg-emerald-600 p-6 rounded-3xl text-white mb-8 shadow-2xl shadow-emerald-500/20 animate-bounce">
          <Vote size={64} />
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-gray-900 leading-none">
          BANGLADESH DIGITAL
          <br />
          <span className="text-emerald-500">VOTECHAIN 2025</span>
        </h1>
        <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg font-medium">
          Secure, transparent, and decentralized national election portal
          powered by Blockchain.
        </p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="bg-gray-900 text-white hover:bg-emerald-600 px-12 py-5 rounded-2xl font-bold transition-all flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95"
        >
          <Wallet size={24} /> Access Portal
        </button>
      </div>
    );
  }

  // 2. ROLE SELECTION (The Portal) - Skip for admin (handled by useEffect)
  if (view === "portal") {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="p-6 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
              <Vote size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase">
              Votechain <span className="text-emerald-500 text-lg">2025</span>
            </h1>
          </div>
          <button
            onClick={() => disconnect()}
            className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <LogOut size={16} /> Disconnect
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-600 mb-3">
              Internal Gateway
            </h2>
            <h3 className="text-5xl font-black text-gray-900 tracking-tight">
              Select Department
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
            <RoleCard
              title="Voter"
              desc="Register identity and cast ballot"
              icon={<User size={40} />}
              color="bg-emerald-500"
              onClick={() => setView("voter")}
            />
            <RoleCard
              title="Party"
              desc="Register candidate info"
              icon={<Flag size={40} />}
              color="bg-blue-500"
              onClick={() => setView("party")}
            />
          </div>
        </main>
      </div>
    );
  }

  // Auto-redirect admin to admin panel on first load
  if (isAdmin && view === "portal") {
    setView("admin");
  }

  // 3. SUB-PAGES (Forms)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <button
          onClick={() => setView("portal")}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Active Wallet
            </p>
            <p className="font-mono text-xs text-emerald-600 font-bold">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-80 border-r border-gray-100 p-8 bg-gray-50/50">
          <div className="sticky top-24">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6 text-center">
              <div
                className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  isAdmin
                    ? "bg-purple-50 text-purple-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isAdmin ? <ShieldCheck size={28} /> : <Wallet size={28} />}
              </div>
              <h4 className="font-bold text-gray-900 mb-1 text-sm uppercase">
                {isAdmin ? "ADMIN ACCOUNT" : "USER ACCOUNT"}
              </h4>
              <p className="text-[10px] text-gray-500 break-all font-mono p-2 bg-gray-50 rounded-lg">
                {address}
              </p>
            </div>
            <div className="px-4">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Live Node
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-8 md:p-20 flex justify-center items-start overflow-y-auto">
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            {view === "voter" && (
              <div className="w-full">
                {/* CASE 1: Completely New User */}
                {myStatus === "new" && <RegisterVoter />}

                {/* CASE 2: User is waiting for Admin to click 'Approve' */}
                {myStatus === "pending" && (
                  <div className="text-center p-16 bg-yellow-50 rounded-[3rem] border border-yellow-100 animate-in zoom-in-95">
                    <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-yellow-900 mb-2 uppercase tracking-tighter">
                      Verification Pending
                    </h2>
                    <p className="text-yellow-700/60 font-medium">
                      The Authority is currently reviewing your NID details.
                      Please check back shortly.
                    </p>
                    <button
                      onClick={() => {
                        setRefreshKey((prev) => prev + 1); // Force re-render
                        const updated = JSON.parse(
                          localStorage.getItem("voter_requests") || "[]"
                        );
                        const current = updated.find(
                          (r) => r.userAddress === address
                        );
                        if (current && current.status !== "pending") {
                          // Status changed, will show new UI on next render
                        }
                      }}
                      className="mt-6 text-yellow-600 font-bold text-xs uppercase tracking-widest border-b border-yellow-200 pb-1 hover:text-yellow-800 transition-colors cursor-pointer"
                    >
                      Tap to Check for Approval
                    </button>
                  </div>
                )}

                {/* CASE 3: Admin Approved - UNLOCK THE BLOCKCHAIN BALLOT */}
                {myStatus === "approved" && <VotingBallot />}

                {/* CASE 4: Admin Rejected */}
                {myStatus === "rejected" && (
                  <div className="text-center p-16 bg-red-50 rounded-[3rem] border border-red-100">
                    <ShieldAlert
                      size={64}
                      className="mx-auto text-red-400 mb-4"
                    />
                    <h2 className="text-2xl font-black text-red-900">
                      Application Denied
                    </h2>
                    <p className="text-red-600/60 mt-2">
                      Your credentials could not be verified by the Election
                      Commission.
                    </p>
                    <button
                      onClick={() => {
                        const existing = JSON.parse(
                          localStorage.getItem("voter_requests") || "[]"
                        );
                        const filtered = existing.filter(
                          (r) => r.userAddress !== address
                        );
                        localStorage.setItem(
                          "voter_requests",
                          JSON.stringify(filtered)
                        );
                        window.dispatchEvent(
                          new Event("voter_requests_updated")
                        );
                        setRefreshKey((prev) => prev + 1);
                      }}
                      className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                      Reapply for Registration
                    </button>
                  </div>
                )}
              </div>
            )}
            {view === "party" && (
              <div className="w-full">
                {/* Party is new - show registration form */}
                {myPartyStatus === "new" && <RegisterParty />}

                {/* Party application is pending */}
                {myPartyStatus === "pending" && (
                  <div className="text-center p-16 bg-blue-50 rounded-[3rem] border border-blue-100 animate-in zoom-in-95">
                    <div className="bg-blue-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <Flag size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-blue-900 mb-2 uppercase tracking-tighter">
                      Nomination Pending
                    </h2>
                    <p className="text-blue-700/60 font-medium">
                      The Election Commission is reviewing your party
                      registration. Please check back shortly.
                    </p>
                    <button
                      onClick={() => {
                        setRefreshKey((prev) => prev + 1);
                      }}
                      className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest border-b border-blue-200 pb-1 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Tap to Check for Approval
                    </button>
                  </div>
                )}

                {/* Party approved - show success */}
                {myPartyStatus === "approved" && (
                  <div className="text-center p-16 bg-emerald-50 rounded-[3rem] border border-emerald-100 animate-in zoom-in-95">
                    <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <Flag size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-emerald-900 mb-2 uppercase tracking-tighter">
                      Party Approved!
                    </h2>
                    <p className="text-emerald-700/60 font-medium">
                      Your party{" "}
                      <span className="font-bold">{myPartyRequest.name}</span>{" "}
                      has been officially registered. Voters can now see your
                      party in the ballot.
                    </p>
                  </div>
                )}

                {/* Party rejected */}
                {myPartyStatus === "rejected" && (
                  <div className="text-center p-16 bg-red-50 rounded-[3rem] border border-red-100">
                    <ShieldAlert
                      size={64}
                      className="mx-auto text-red-400 mb-4"
                    />
                    <h2 className="text-2xl font-black text-red-900">
                      Nomination Denied
                    </h2>
                    <p className="text-red-600/60 mt-2">
                      Your party registration could not be approved by the
                      Election Commission.
                    </p>
                    <button
                      onClick={() => {
                        const existing = JSON.parse(
                          localStorage.getItem("party_requests") || "[]"
                        );
                        const filtered = existing.filter(
                          (r) => r.userAddress !== address
                        );
                        localStorage.setItem(
                          "party_requests",
                          JSON.stringify(filtered)
                        );
                        window.dispatchEvent(
                          new Event("party_requests_updated")
                        );
                        setRefreshKey((prev) => prev + 1);
                      }}
                      className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                      Reapply for Nomination
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HARD SECURITY LOCK: Component literally won't load if not admin */}
            {/* Inside the SUB-PAGES section of App.jsx */}
            {view === "admin" &&
              (isAdmin ? (
                <AdminPanel />
              ) : (
                <div className="text-center py-20 bg-red-50 rounded-[3rem] border border-red-100">
                  <ShieldAlert
                    size={80}
                    className="mx-auto text-red-400 mb-6 opacity-40"
                  />
                  <h2 className="text-4xl font-black text-red-900 tracking-tight">
                    Unauthorized
                  </h2>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RoleCard({ title, desc, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-gray-100 p-12 rounded-[3rem] text-center flex flex-col items-center hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:border-emerald-200 transition-all duration-500 hover:-translate-y-2"
    >
      <div
        className={`${color} w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 text-white shadow-2xl transition-all duration-500`}
      >
        {icon}
      </div>
      <h3 className="text-3xl font-black mb-4 text-gray-900 tracking-tight uppercase">
        {title}
      </h3>
      <p className="text-gray-400 font-medium leading-relaxed px-2 text-sm">
        {desc}
      </p>
    </button>
  );
}

export default App;
