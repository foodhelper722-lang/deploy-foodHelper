import { useState, useEffect, useRef } from "react";

const BASE = "https://grocerrybackend.onrender.com";
const BANNER_API = `${BASE}/api/advertising-banner`;
const CATEGORY_API = `${BASE}/api/categories`;
const PRODUCT_API = `${BASE}/api/public/products`;

const defaultForm = {
  title: "",
  bannerPosition: "front",
  categoryId: "",
  subcategoryId: "",
  productSource: "",
  productId: "",
  status: "active",
  startDate: "",
  endDate: "",
};

export default function AdvertisingBannerPage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(false);
  const [prodsLoading, setProdsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filterPos, setFilterPos] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();
  const formRef = useRef();

  /* ── Fetch categories ── */
  useEffect(() => {
    setCatsLoading(true);
    fetch(CATEGORY_API)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCatsLoading(false));
  }, []);

  /* ── Fetch banners ── */
  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(BANNER_API);
      const data = await res.json();
      if (data.success) setBanners(data.data || []);
    } catch {
      showAlertMsg("Server error — could not load banners.", "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadBanners(); }, []);

  /* ── Fetch products when source changes ── */
  useEffect(() => {
    if (!form.productSource) { setProducts([]); return; }
    setProdsLoading(true);
    fetch(`${PRODUCT_API}?source=${form.productSource}&limit=200`)
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []))
      .catch(() => setProducts([]))
      .finally(() => setProdsLoading(false));
  }, [form.productSource]);

  /* ── Helpers ── */
  const showAlertMsg = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const getSubcategories = () => {
    const cat = categories.find((c) => c._id === form.categoryId);
    return cat?.subcategories || [];
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "categoryId") next.subcategoryId = "";
      if (field === "bannerPosition") {
        next.productSource = "";
        next.productId = "";
        next.categoryId = "";
        next.subcategoryId = "";
      }
      if (field === "productSource") next.productId = "";
      return next;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];   
    if (!file) return;              
    setImageFile(file); 
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };  

  const openAddForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openEditForm = (banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      bannerPosition: banner.bannerPosition || "front",
      categoryId: banner.categoryId || "",
      subcategoryId: banner.subcategoryId || "",
      productSource: banner.productSource || "",
      productId: banner.productId || "",
      status: banner.status || "active",
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
    });
    setImageFile(null);
    setImagePreview(banner.image || "");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setForm(defaultForm);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!imageFile && !editingId) {
      showAlertMsg("Please select a banner image.", "error");
      return;
    }
    if (!form.bannerPosition) {
      showAlertMsg("Please select banner position.", "error");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    if (imageFile) fd.append("image", imageFile);
    fd.append("title", form.title);
    fd.append("bannerPosition", form.bannerPosition);
    if (form.categoryId) fd.append("categoryId", form.categoryId);
    if (form.subcategoryId) fd.append("subcategoryId", form.subcategoryId);
    if (form.productSource) fd.append("productSource", form.productSource);
    if (form.productId) fd.append("productId", form.productId);
    fd.append("status", form.status);
    if (form.startDate) fd.append("startDate", form.startDate);
    if (form.endDate) fd.append("endDate", form.endDate);

    try {
      const url = editingId ? `${BANNER_API}/${editingId}` : BANNER_API;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (data.success) {
        showAlertMsg(editingId ? "Banner updated!" : "Banner added!");
        closeForm();
        loadBanners();
      } else {
        showAlertMsg(data.message || "Something went wrong.", "error");
      }
    } catch (e) {
      showAlertMsg("Server error: " + e.message, "error");
    }
    setSubmitting(false);
  };

  /* ── Toggle ── */
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${BANNER_API}/toggle/${id}`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: data.data.status } : b))
        );
      }
    } catch {
      showAlertMsg("Toggle failed.", "error");
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BANNER_API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b._id !== id));
        showAlertMsg("Banner deleted.");
      }
    } catch {
      showAlertMsg("Delete failed.", "error");
    }
    setDeleteConfirm(null);
  };

  /* ── Filter ── */
  const filtered = banners.filter((b) => {
    if (filterPos && b.bannerPosition !== filterPos) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  /* ── Get names for table display ── */
  const getCategoryName = (catId) => {
    const c = categories.find((x) => x._id === catId);
    return c?.name || "—";
  };
  const getSubcategoryName = (catId, subId) => {
    const c = categories.find((x) => x._id === catId);
    const s = c?.subcategories?.find((x) => x._id === subId);
    return s?.name || null;
  };

  return (
    <div style={s.page}>
      {/* Alert toast */}
      {alert && (
        <div style={{ ...s.toast, ...(alert.type === "error" ? s.toastError : s.toastSuccess) }}>
          {alert.type === "success" ? "✓" : "✕"} {alert.message}
        </div>
      )}

      {/* Delete modal */}
      {deleteConfirm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>Delete this banner?</p>
            <p style={s.modalSub}>This cannot be undone.</p>
            <div style={s.modalBtns}>
              <button style={s.btnOutline} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={s.btnDanger} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Advertising Banners</h1>
          <p style={s.subtitle}>Manage front & back promotional banners</p>
        </div>
        <button style={s.btnPrimary} onClick={openAddForm}>+ Add Banner</button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div ref={formRef} style={s.card}>
          <div style={s.formHead}>
            <span style={s.formTitle}>{editingId ? "Edit banner" : "Add new banner"}</span>
            <button style={s.closeBtn} onClick={closeForm}>✕</button>
          </div>

          {/* Position toggle */}
          <div style={s.field}>
            <label style={s.label}>Banner position</label>
            <div style={s.seg}>
              {["front", "back"].map((p) => (
                <button
                  key={p}
                  style={{ ...s.segBtn, ...(form.bannerPosition === p ? s.segBtnOn : {}) }}
                  onClick={() => handleFormChange("bannerPosition", p)}
                >
                  {p === "front" ? "🖥  Front" : "📦  Back"}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div style={s.field}>
            <label style={s.label}>
              Banner image {!editingId && <span style={{ color: "#e24b4a" }}>*</span>}
            </label>
            <div style={s.uploadBox} onClick={() => fileRef.current.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={s.imgPreview} />
              ) : (
                <div style={s.uploadInner}>
                  <span style={{ fontSize: 30 }}>🖼</span>
                  <p style={s.uploadText}>Click to upload</p>
                  <p style={s.uploadHint}>JPG, PNG, WEBP — max 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {/* Grid fields */}
          <div style={s.grid}>
            {/* Title */}
            <div style={{ ...s.field, gridColumn: "1/-1" }}>
              <label style={s.label}>
                Title <span style={s.optional}>(optional)</span>
              </label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Summer Sale Banner"
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>

            {/* Category */}
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select
                style={s.input}
                value={form.categoryId}
                onChange={(e) => handleFormChange("categoryId", e.target.value)}
                disabled={catsLoading}
              >
                <option value="">{catsLoading ? "Loading..." : "— Select category —"}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div style={s.field}>
              <label style={s.label}>Subcategory</label>
              <select
                style={s.input}
                value={form.subcategoryId}
                onChange={(e) => handleFormChange("subcategoryId", e.target.value)}
                disabled={!form.categoryId}
              >
                <option value="">— Select subcategory —</option>
                {getSubcategories().map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Back-only: product source + product */}
            {form.bannerPosition === "back" && (
              <>
                <div style={s.field}>
                  <label style={s.label}>Product source</label>
                  <select
                    style={s.input}
                    value={form.productSource}
                    onChange={(e) => handleFormChange("productSource", e.target.value)}
                  >
                    <option value="">— Select source —</option>
                    <option value="admin">Admin product</option>
                    <option value="vendor">Vendor product</option>
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Product</label>
                  <select
                    style={s.input}
                    value={form.productId}
                    onChange={(e) => handleFormChange("productId", e.target.value)}
                    disabled={!form.productSource || prodsLoading}
                  >
                    <option value="">
                      {prodsLoading ? "Loading products..." : "— Select product —"}
                    </option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.category?.name ? `(${p.category.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Start date */}
            <div style={s.field}>
              <label style={s.label}>Start date</label>
              <input
                style={s.input}
                type="date"
                value={form.startDate}
                onChange={(e) => handleFormChange("startDate", e.target.value)}
              />
            </div>

            {/* End date */}
            <div style={s.field}>
              <label style={s.label}>
                End date <span style={s.optional}>(optional)</span>
              </label>
              <input
                style={s.input}
                type="date"
                value={form.endDate}
                onChange={(e) => handleFormChange("endDate", e.target.value)}
              />
            </div>

            {/* Status */}
            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select
                style={s.input}
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Form actions */}
          <div style={s.formActions}>
            <button style={s.btnOutline} onClick={closeForm}>Cancel</button>
            <button
              style={{ ...s.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingId ? "Update banner" : "Save banner"}
            </button>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={s.card}>
        {/* Table toolbar */}
        <div style={s.toolbar}>
          <span style={s.tableTitle}>All banners ({filtered.length})</span>
          <div style={s.toolbarRight}>
            <select style={s.filterSel} value={filterPos} onChange={(e) => setFilterPos(e.target.value)}>
              <option value="">All positions</option>
              <option value="front">Front</option>
              <option value="back">Back</option>
            </select>
            <select style={s.filterSel} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button style={s.btnOutline} onClick={loadBanners}>↻ Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div style={s.stats}>
          {[
            { label: "Total", value: banners.length, color: "#185FA5" },
            { label: "Active", value: banners.filter((b) => b.status === "active").length, color: "#3B6D11" },
            { label: "Front", value: banners.filter((b) => b.bannerPosition === "front").length, color: "#185FA5" },
            { label: "Back", value: banners.filter((b) => b.bannerPosition === "back").length, color: "#854F0B" },
          ].map((st) => (
            <div key={st.label} style={s.statCard}>
              <span style={{ ...s.statVal, color: st.color }}>{st.value}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.empty}>Loading banners...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🖼</span>
            No banners found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Image", "Title", "Position", "Category", "Status", "End date", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((banner) => (
                  <tr key={banner._id} style={s.tr}>
                    <td style={s.td}>
                      <img
                        src={banner.image}
                        alt={banner.title || "banner"}
                        style={s.thumb}
                        onError={(e) => { e.target.style.opacity = 0; }}
                      />
                    </td>
                    <td style={s.td}>
                      <span style={s.bannerName}>
                        {banner.title || <span style={{ color: "#bbb" }}>—</span>}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        ...(banner.bannerPosition === "front" ? s.badgeFront : s.badgeBack),
                      }}>
                        {banner.bannerPosition}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={s.catText}>{getCategoryName(banner.categoryId)}</span>
                      {banner.subcategoryId && (
                        <span style={s.subText}>
                          {" / "}{getSubcategoryName(banner.categoryId, banner.subcategoryId)}
                        </span>
                      )}
                    </td>
                    <td style={s.td}>
                      {/* Toggle switch */}
                      <div
                        style={{
                          ...s.toggleTrack,
                          background: banner.status === "active" ? "#185FA5" : "#ccc",
                        }}
                        onClick={() => handleToggle(banner._id)}
                      >
                        <div style={{
                          ...s.toggleThumb,
                          transform: banner.status === "active" ? "translateX(16px)" : "translateX(0px)",
                        }} />
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.dateText}>
                        {banner.endDate
                          ? new Date(banner.endDate).toLocaleDateString("en-IN")
                          : "—"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.iconBtn} onClick={() => openEditForm(banner)} title="Edit">✏️</button>
                        <button
                          style={{ ...s.iconBtn, ...s.iconBtnDanger }}
                          onClick={() => setDeleteConfirm(banner._id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: {
    padding: "24px",
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1a1a1a",
  },
  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  },
  toastSuccess: { background: "#EAF3DE", color: "#3B6D11" },
  toastError: { background: "#FCEBEB", color: "#A32D2D" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 9998,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    minWidth: 300,
    textAlign: "center",
  },
  modalTitle: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
  modalSub: { fontSize: 13, color: "#888", marginBottom: 20 },
  modalBtns: { display: "flex", gap: 10, justifyContent: "center" },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 13, color: "#888", marginTop: 4, marginBottom: 0 },
  card: {
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 20,
  },
  formHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: "1px solid #f0f0f0",
  },
  formTitle: { fontSize: 16, fontWeight: 600 },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#888",
    padding: "4px 8px",
    borderRadius: 6,
  },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: 500, color: "#555" },
  optional: { color: "#bbb", fontWeight: 400, fontSize: 12 },
  input: {
    padding: "9px 12px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  seg: {
    display: "flex",
    background: "#f5f5f5",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    color: "#666",
  },
  segBtnOn: {
    background: "#fff",
    color: "#1a1a1a",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  uploadBox: {
    border: "2px dashed #ddd",
    borderRadius: 10,
    padding: 16,
    textAlign: "center",
    cursor: "pointer",
    minHeight: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  uploadText: { fontSize: 13, color: "#555", margin: 0 },
  uploadHint: { fontSize: 11, color: "#aaa", margin: 0 },
  imgPreview: { width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 8 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  formActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid #f0f0f0",
  },
  btnPrimary: {
    padding: "9px 22px",
    background: "#185FA5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutline: {
    padding: "9px 16px",
    background: "#fff",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "9px 16px",
    background: "#e24b4a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  tableTitle: { fontSize: 14, fontWeight: 600 },
  toolbarRight: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  filterSel: {
    padding: "6px 10px",
    fontSize: 12,
    border: "1px solid #ddd",
    borderRadius: 7,
    background: "#fff",
    color: "#333",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    background: "#f8f9fb",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statVal: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 12, color: "#888" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#999",
    borderBottom: "1px solid #f0f0f0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  tr: {},
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f8f8f8",
    verticalAlign: "middle",
  },
  thumb: {
    width: 64,
    height: 40,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #eee",
    display: "block",
  },
  bannerName: { fontWeight: 500 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  badgeFront: { background: "#E6F1FB", color: "#0C447C" },
  badgeBack: { background: "#FAEEDA", color: "#633806" },
  catText: { fontSize: 12, color: "#444" },
  subText: { fontSize: 12, color: "#999" },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 100,
    padding: 3,
    cursor: "pointer",
    transition: "background 0.2s",
    position: "relative",
    display: "inline-block",
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
    position: "absolute",
    top: 3,
    left: 3,
  },
  dateText: { fontSize: 12, color: "#888" },
  actions: { display: "flex", gap: 6 },
  iconBtn: {
    padding: "5px 8px",
    background: "#f5f5f5",
    border: "1px solid #eee",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 14,
  },
  iconBtnDanger: { background: "#fff5f5", border: "1px solid #fdd" },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#bbb",
    fontSize: 14,
  },
};