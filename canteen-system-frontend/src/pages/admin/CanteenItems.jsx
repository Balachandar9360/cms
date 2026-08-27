import { useEffect, useState } from "react";
import {
  listCanteenItems, createCanteenItem, updateCanteenItem, setCanteenItemStatus,
  restockItem, adjustItemStock, getRatingSummary,
} from "../../api/adminApi";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import StarRating from "../../components/StarRating";
import StockActionModal from "../../components/StockActionModal";
import { WalletPill } from "../../components/WalletStub";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

const EMPTY = { itemName: "", description: "", category: "", price: "", available: true };

export default function CanteenItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [ratings, setRatings] = useState({});
  const [filterInactive, setFilterInactive] = useState(false);
  const [filterUnavailable, setFilterUnavailable] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    listCanteenItems()
      .then((res) => setItems(res.data.data.content || res.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load canteen items")))
      .finally(() => setLoading(false));
  };

  const loadRatings = () => {
    getRatingSummary()
      .then((res) => {
        const map = {};
        (res.data.data || []).forEach((r) => { map[r.itemId] = r; });
        setRatings(map);
      })
      .catch(() => { /* non-critical — table still works without ratings */ });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); loadRatings(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal({ mode: "create" }); };
  const openEdit = (item) => {
    setForm({
      itemName: item.itemName, description: item.description || "",
      category: item.category || "", price: item.price, available: item.available,
    });
    setModal({ mode: "edit", item });
  };

  const set = (key) => (e) => {
    const val = key === "available" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price) };
    try {
      if (modal.mode === "create") {
        await createCanteenItem(payload);
        toast.success(`"${form.itemName}" added to the canteen menu`);
      } else {
        await updateCanteenItem(modal.item.id, payload);
        toast.success(`"${form.itemName}" updated`);
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save item"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const next = !item.activeStatus;
    try {
      await setCanteenItemStatus(item.id, next);
      toast.success(`"${item.itemName}" ${next ? "activated" : "deactivated"}`);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleStockSubmit = async (amount, reason) => {
    const { item, mode } = stockModal;
    if (mode === "restock") {
      await restockItem(item.id, amount, reason);
      toast.success(`Added ${amount} ${item.unit} to "${item.itemName}"`);
    } else {
      await adjustItemStock(item.id, amount, reason);
      toast.success(`Stock for "${item.itemName}" adjusted by ${amount}`);
    }
    load();
  };

  // Apply filters — each is exclusive (only one active at a time)
  const visibleItems = items.filter((it) => {
    if (filterInactive && it.activeStatus) return false;
    if (filterUnavailable && it.available) return false;
    if (filterOutOfStock && (it.stockQuantity ?? 0) > 0) return false;
    return true;
  });

  const activeFilter = filterInactive ? "inactive" : filterUnavailable ? "unavailable" : filterOutOfStock ? "outofstock" : null;
  const clearFilters = () => { setFilterInactive(false); setFilterUnavailable(false); setFilterOutOfStock(false); };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Menu</span>
          <h1>Canteen Items</h1>
          <p className="desc">Manage what students can purchase from their wallet.</p>
        </div>
        <div className="row-actions">
          <button
            className={`btn btn-sm ${filterInactive ? "btn-brass" : "btn-ghost"}`}
            onClick={() => { setFilterInactive((v) => !v); setFilterUnavailable(false); setFilterOutOfStock(false); }}
          >
            {filterInactive ? "✕ Inactive" : "Show Inactive"}
          </button>
          <button
            className={`btn btn-sm ${filterUnavailable ? "btn-brass" : "btn-ghost"}`}
            onClick={() => { setFilterUnavailable((v) => !v); setFilterInactive(false); setFilterOutOfStock(false); }}
          >
            {filterUnavailable ? "✕ Unavailable" : "Show Unavailable"}
          </button>
          <button
            className={`btn btn-sm ${filterOutOfStock ? "btn-brass" : "btn-ghost"}`}
            onClick={() => { setFilterOutOfStock((v) => !v); setFilterInactive(false); setFilterUnavailable(false); }}
          >
            {filterOutOfStock ? "✕ Out of Stock" : "Out of Stock"}
          </button>
          <button className="btn btn-brass btn-sm" onClick={openCreate}>+ Add Item</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="grid">
            <colgroup>
              <col style={{ width: "18%" }} />{/* Item */}
              <col style={{ width: "10%" }} />{/* Category */}
              <col style={{ width: "8%" }} />{/* Price */}
              <col style={{ width: "11%" }} />{/* Stock */}
              <col style={{ width: "10%" }} />{/* Rating */}
              <col style={{ width: "12%" }} />{/* Availability */}
              <col style={{ width: "10%" }} />{/* Status */}
              <col style={{ width: "21%" }} />{/* Actions */}
            </colgroup>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Availability</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={5} cols={8} />}
              {!loading && visibleItems.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "32px 16px" }}>
                  <EmptyState
                    glyph="▤"
                    title={
                      activeFilter === "inactive" ? "No inactive items" :
                      activeFilter === "unavailable" ? "No unavailable items" :
                      activeFilter === "outofstock" ? "No out-of-stock items" :
                      "No canteen items yet"
                    }
                    description={activeFilter ? "Try clearing the filter." : "Add the first item to the menu."}
                  />
                </td></tr>
              )}
              {!loading && visibleItems.map((it) => {
                const outOfStock = (it.stockQuantity ?? 0) === 0;
                const lowStock = !outOfStock && (it.stockQuantity ?? 0) <= (it.lowStockThreshold ?? 0);
                return (
                  <tr key={it.id}>
                    <td>
                      <div className="td-strong">{it.itemName}</div>
                      {it.description && <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{it.description}</div>}
                    </td>
                    <td><Badge tone="neutral">{it.category || "—"}</Badge></td>
                    <td><WalletPill amount={it.price} /></td>
                    <td>
                      <span className="mono" style={{ fontSize: 12.5 }}>
                        {it.stockQuantity ?? 0} {it.unit || "pcs"}
                      </span>
                      {outOfStock && (
                        <span style={{ display: "block", fontSize: 11, color: "#c62828", fontWeight: 600, marginTop: 2 }}>Out of stock</span>
                      )}
                      {lowStock && (
                        <span style={{ display: "block", fontSize: 11, color: "#e65100", fontWeight: 600, marginTop: 2 }}>Low stock</span>
                      )}
                    </td>
                    <td>
                      {ratings[it.id] ? (
                        <div>
                          <StarRating value={ratings[it.id].avgRating} size={13} />
                          <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1 }}>
                            {ratings[it.id].avgRating} ({ratings[it.id].ratingCount})
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>No ratings</span>
                      )}
                    </td>
                    <td>{it.available ? <Badge tone="credit">Available</Badge> : <Badge tone="debit">Unavailable</Badge>}</td>
                    <td>{it.activeStatus ? <Badge tone="active">Active</Badge> : <Badge tone="inactive">Inactive</Badge>}</td>
                    <td>
                      <div className="item-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(it)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStockModal({ item: it, mode: "restock" })}>Restock</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStockModal({ item: it, mode: "adjust" })}>Adjust</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(it)}>
                          {it.activeStatus ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <EmptyState glyph="▤" title="No canteen items yet" description="Add the first item to the menu." />
          )}
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add Canteen Item" : "Edit Canteen Item"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
            <button className="btn btn-brass" onClick={submit} disabled={saving}>
              {saving && <span className="btn-spinner" />}
              {modal?.mode === "create" ? "Add Item" : "Save Changes"}
            </button>
          </>
        }
      >
        <form onSubmit={submit} id="item-form">
          <div className="form-field full">
            <label>Item Name<span className="req">*</span></label>
            <input value={form.itemName} onChange={set("itemName")} required />
          </div>
          <div className="form-field full">
            <label>Description</label>
            <input value={form.description} onChange={set("description")} placeholder="Optional" />
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Category<span className="req">*</span></label>
              <input value={form.category} onChange={set("category")} placeholder="e.g. MEALS" required />
            </div>
            <div className="form-field">
              <label>Price (₹)<span className="req">*</span></label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required />
            </div>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="available" checked={form.available} onChange={set("available")} />
            <label htmlFor="available" style={{ margin: 0, fontWeight: 500 }}>Available for purchase</label>
          </div>
        </form>
      </Modal>

      <StockActionModal
        item={stockModal?.item}
        mode={stockModal?.mode}
        onClose={() => setStockModal(null)}
        onSubmit={handleStockSubmit}
      />
    </>
  );
}
