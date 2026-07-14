import { useState, useEffect } from "react";
import { getAddressAvatar } from "../utils/avatar";

function AddressBook() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Load contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("stellarpay_contacts");
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse contacts:", e);
      }
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (updated) => {
    setContacts(updated);
    localStorage.setItem("stellarpay_contacts", JSON.stringify(updated));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert("Name and address are required.");
      return;
    }
    if (address.trim().length !== 56 || !address.trim().startsWith("G")) {
      alert("Please enter a valid 56-character Stellar address.");
      return;
    }

    const newContact = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
    };

    saveContacts([newContact, ...contacts]);
    setName("");
    setAddress("");
  };

  const handleDelete = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContacts(updated);
  };

  const handleCopy = (addr, id) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Add Contact Card */}
      <div className="border-2.5 border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl p-5 shadow-[4px_4px_0px_0px_var(--border-color)] md:col-span-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-secondary)] mb-4">
          // Add Contact
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
              Alias / Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alice's Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg brutalist-input outline-none text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-[var(--text-secondary)] mb-2">
              Stellar Address
            </label>
            <input
              type="text"
              placeholder="e.g. GBG2...4XZP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-lg brutalist-input outline-none text-sm font-mono font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full brutalist-button-accent py-3 rounded-lg font-bold text-xs"
          >
            Save Contact
          </button>
        </form>
      </div>

      {/* Contacts List Card */}
      <div className="border-2.5 border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl p-5 shadow-[4px_4px_0px_0px_var(--border-color)] md:col-span-2 flex flex-col h-full">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-secondary)] mb-4">
          // Contact Index
        </h3>
        
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-app)]/30 rounded-xl my-auto">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-xs uppercase tracking-wider font-bold">Address Book is empty.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {contacts.map((c) => {
              const avatar = getAddressAvatar(c.address);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between border-2 border-[var(--border-color)] bg-[var(--bg-app)]/30 p-3 rounded-lg hover:shadow-[2px_2px_0px_0px_var(--border-color)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold border-2 border-[var(--border-color)]"
                      style={{ background: avatar.gradient }}
                    >
                      {avatar.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{c.name}</h4>
                      <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5">
                        {c.address.slice(0, 10)}...{c.address.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(c.address, c.id)}
                      className="p-1.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1px_1px_0px_0px_var(--border-color)] cursor-pointer text-xs"
                    >
                      {copiedId === c.id ? (
                        <span className="text-[10px] text-emerald-500 font-extrabold px-0.5">copied!</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 border border-[var(--border-color)] bg-red-100 hover:bg-red-200 text-red-700 rounded active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1px_1px_0px_0px_var(--border-color)] cursor-pointer"
                      title="Delete Contact"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default AddressBook;
