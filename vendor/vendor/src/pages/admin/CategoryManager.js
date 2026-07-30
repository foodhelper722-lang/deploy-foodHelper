

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./CategoryManager.css";


// const API_BASE = "https://grocerrybackend.onrender.com/api/categories";

// const emptyCategoryForm = { name: "", image: null };
// const emptySubForm = { name: "", image: null };

// const CategoryManager = () => {
//   const [categories, setCategories] = useState([]);
//   const [catForm, setCatForm] = useState(emptyCategoryForm);
//   const [editCatId, setEditCatId] = useState(null);
// const [openMenuId, setOpenMenuId] = useState(null);
//   const [expandedCat, setExpandedCat] = useState(null);
//   const [subForm, setSubForm] = useState(emptySubForm);
//   const [showCatForm, setShowCatForm] = useState(false);

//   const [editSubInfo, setEditSubInfo] = useState({ catId: null, subId: null });

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   const [searchText, setSearchText] = useState("");

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState("category"); // "category" | "subcategory"
//   const [modalTarget, setModalTarget] = useState({ catId: null, subId: null });

//   // local preview for modal image
//   const [modalPreview, setModalPreview] = useState(null);

//   const fileInputRef = useRef(null);

//   /* ------------------- Fetch Categories -------------------- */
//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(API_BASE);
//       const cats = res.data.categories || res.data.data || [];
//       setCategories(
//         cats.map((c) => ({
//           ...c,
//           subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
//         }))
//       );
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load categories");
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   /* ------------------- Category Input -------------------- */
//   const onCatInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files) {
//       setCatForm((p) => ({ ...p, image: files[0] }));
//     } else {
//       setCatForm((p) => ({ ...p, [name]: value }));
//     }
//   };

//   /* ------------------- Save Category (Add / Update) -------------------- */
//   const submitCategory = async (e) => {
//     e.preventDefault();

//     if (!catForm.name.trim()) return toast.warn("Enter category name");

//     const fd = new FormData();
//     fd.append("name", catForm.name);
//     if (catForm.image) fd.append("image", catForm.image);

//     try {
//       if (editCatId) {
//         await axios.put(`${API_BASE}/${editCatId}`, fd);
//         toast.success("Category updated");
//       } else {
//         await axios.post(API_BASE, fd);
//         toast.success("Category added");
//       }
//       setCatForm(emptyCategoryForm);
//       setEditCatId(null);
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       toast.error("Save failed");
//     }
//   };

//   /* ------------------- Delete Category -------------------- */
//   const deleteCategory = async (id) => {
//     if (!window.confirm("Delete this category?")) return;
//     try {
//       await axios.delete(`${API_BASE}/${id}`);
//       toast.success("Category deleted");
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   /* ------------------- Sub Input -------------------- */
//   const onSubInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files) {
//       setSubForm((p) => ({ ...p, image: files[0] }));
//     } else {
//       setSubForm((p) => ({ ...p, [name]: value }));
//     }
//   };

//   /* ------------------- Save Subcategory -------------------- */
//   const submitSub = async (e, catId) => {
//     e.preventDefault();

//     if (!subForm.name.trim()) return toast.warn("Enter subcategory name");

//     const fd = new FormData();
//     fd.append("name", subForm.name);
//     if (subForm.image) fd.append("image", subForm.image);

//     try {
//       if (editSubInfo.subId) {
//         await axios.put(
//           `${API_BASE}/${editSubInfo.catId}/sub/${editSubInfo.subId}`,
//           fd
//         );
//         toast.success("Subcategory updated");
//       } else {
//         await axios.post(`${API_BASE}/${catId}/sub`, fd);
//         toast.success("Subcategory added");
//       }

//       setSubForm(emptySubForm);
//       setEditSubInfo({ catId: null, subId: null });
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       toast.error("Save failed");
//     }
//   };

//   /* ------------------- Delete Subcategory -------------------- */
//   const deleteSub = async (catId, subId) => {
//     if (!window.confirm("Delete this subcategory?")) return;

//     try {
//       await axios.delete(`${API_BASE}/${catId}/sub/${subId}`);
//       toast.success("Subcategory deleted");
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   /* ------------------- Modal handlers -------------------- */
//   const openCategoryModal = (cat) => {
//     setModalMode("category");
//     setModalTarget({ catId: cat._id, subId: null });
//     setModalPreview(cat.image || null);
//     setCatForm({ name: cat.name || "", image: null });
//     setIsModalOpen(true);
//   };

//   const openSubModal = (cat, sub) => {
//     setModalMode("subcategory");
//     setModalTarget({ catId: cat._id, subId: sub._id });
//     setModalPreview(sub.image || null);
//     setSubForm({ name: sub.name || "", image: null });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setModalPreview(null);
//     setModalTarget({ catId: null, subId: null });
//     setCatForm(emptyCategoryForm);
//     setSubForm(emptySubForm);
//     setEditCatId(null);
//     setEditSubInfo({ catId: null, subId: null });
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleModalImageChange = (e) => {
//     const file = e.target.files && e.target.files[0];
//     if (file) {
//       setModalPreview(URL.createObjectURL(file));
//       if (modalMode === "category") {
//         setCatForm((p) => ({ ...p, image: file }));
//       } else {
//         setSubForm((p) => ({ ...p, image: file }));
//       }
//     }
//   };

//   const saveModal = async (e) => {
//     e.preventDefault();
//     try {
//       if (modalMode === "category") {
//         if (!catForm.name.trim()) return toast.warn("Enter category name");
//         const fd = new FormData();
//         fd.append("name", catForm.name);
//         if (catForm.image) fd.append("image", catForm.image);
//         await axios.put(`${API_BASE}/${modalTarget.catId}`, fd);
//         toast.success("Category updated");
//       } else {
//         if (!subForm.name.trim()) return toast.warn("Enter subcategory name");
//         const fd = new FormData();
//         fd.append("name", subForm.name);
//         if (subForm.image) fd.append("image", subForm.image);
//         await axios.put(
//           `${API_BASE}/${modalTarget.catId}/sub/${modalTarget.subId}`,
//           fd
//         );
//         toast.success("Subcategory updated");
//       }
//       closeModal();
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       toast.error("Update failed");
//     }
//   };

//   /* ------------------- Search filter -------------------- */
//   const filterCategories = (cats, q) => {
//     if (!q || !q.trim()) return cats;
//     const t = q.trim().toLowerCase();

//     // show categories where category name matches OR any subcategory matches
//     return cats
//       .map((c) => {
//         const matchedSubs = c.subcategories.filter((s) =>
//           (s.name || "").toLowerCase().includes(t)
//         );
//         const categoryMatches = (c.name || "").toLowerCase().includes(t);
//         if (categoryMatches) return { ...c }; // show full category
//         if (matchedSubs.length) {
//           // if only sub matches, include category but only matched subs (for clarity)
//           return { ...c, subcategories: matchedSubs };
//         }
//         return null;
//       })
//       .filter(Boolean);
//   };

//   /* ------------------- Pagination -------------------- */
//   const filtered = filterCategories(categories, searchText);
//   const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(1);
    
//   }, [filtered.length, totalPages]);

//   const lastIndex = currentPage * itemsPerPage;
//   const firstIndex = lastIndex - itemsPerPage;
//   const currentCats = filtered.slice(firstIndex, lastIndex);
// <button
//   className="add-cat-btn"
//   onClick={() => setShowCatForm(!showCatForm)}
// >
//   {showCatForm ? "Close" : "Add Category"}
// </button>

//   /* ------------------- UI -------------------- */
//   return (
//     <div className="category-container">
//       <ToastContainer />
 
//       <div className="header">
//         <h2>📂 Category Manager</h2>
//         <p>Add categories & subcategories (mobile-friendly)</p>

// <input
//           className="search-input"
//           placeholder="Search categories or subcategories..."
//           value={searchText}
//           onChange={(e) => {
//             setSearchText(e.target.value);
//             setCurrentPage(1);
//           }}
//         /> 
        
//       </div>

     

//       {/* Search + Category Form */}
//       <div className="top-row">
        
        

//         <form className="category-form" onSubmit={submitCategory}>
//           <div className="form-row">
//             <input
//               name="name"
//               type="text"
//               placeholder="Enter category name"
//               value={catForm.name}
//               onChange={onCatInputChange}
//             />

//             <input
//               name="image"
//               type="file"
//               accept="image/*"
//               onChange={onCatInputChange}
//             />

//             <button type="submit">
//               {editCatId ? "Update Category" : "Add Category"}
//             </button>

//             {editCatId && (
//               <button
//                 className="cancel-btn"
//                 type="button"
//                 onClick={() => setEditCatId(null)}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* ------------------ Desktop Table ------------------ */}
//       <div className="category-list">
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Subcategories</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {currentCats.map((cat, i) => (
//               <React.Fragment key={cat._id}>
//                 <tr>
//                   <td>{firstIndex + i + 1}</td>
//                   <td>
//                     {cat.image ? (
//                       <img src={cat.image} className="table-img" alt="" />
//                     ) : (
//                       "No Image"
//                     )}
//                   </td>
//                   <td>{cat.name}</td>

//                   <td>
//                     {cat.subcategories.length}{" "}
//                     <button
//                       className="small-btn"
//                       onClick={() =>
//                         setExpandedCat(expandedCat === cat._id ? null : cat._id)
//                       }
//                     >
//                       {expandedCat === cat._id ? "Hide" : "Manage"}
//                     </button>
//                   </td>

//                   {/* <td>
//                     <button
//                       onClick={() => openCategoryModal(cat)}
//                       className="edit-btn"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => deleteCategory(cat._id)}
//                       className="delete-btn"
//                     >
//                       Delete
//                     </button>
//                   </td> */}

//                       <td>
//   <div className="dots-wrap">
//     <button
//       className="dots-btn"
//       onClick={(e) => {
//         e.stopPropagation();
//         setExpandedCat(null); // menu click se sub collapse na ho
//         setOpenMenuId(openMenuId === cat._id ? null : cat._id);
//       }}
//     >
//       ⋯
//     </button>

//     {openMenuId === cat._id && (
//       <div className="dots-menu">
//         <button
//           className="menu-item"
//           onClick={() => {
//             openCategoryModal(cat);
//             setOpenMenuId(null);
//           }}
//         >
//           Edit
//         </button>

//         <button
//           className="menu-item"
//           onClick={() => {
//             deleteCategory(cat._id);
//             setOpenMenuId(null);
//           }}
//         >
//           Delete
//         </button>
//       </div>
//     )}
//   </div>
// </td>





//                 </tr>

//                 {/* Sub category section */}
//                 {expandedCat === cat._id && (
//                   <tr>
//                     <td colSpan="5">
//                       <div className="sub-section">
//                         <h4>{cat.name} - Subcategories</h4>

//                         <div className="sub-list">
//                           {cat.subcategories.map((sub) => (
//                             <div className="sub-item" key={sub._id}>
//                               <div className="sub-left">
//                                 {sub.image ? (
//                                   <img
//                                     src={sub.image}
//                                     className="sub-thumb"
//                                     alt=""
//                                   />
//                                 ) : (
//                                   <div className="sub-thumb no-img">No</div>
//                                 )}
//                                 <div className="sub-name">{sub.name}</div>
//                               </div>
// {/* 
//                               <div className="sub-actions">
//                                 <button
//                                   className="edit-btn small"
//                                   onClick={() => openSubModal(cat, sub)}
//                                 >
//                                   Edit
//                                 </button>

//                                 <button
//                                   className="delete-btn small"
//                                   onClick={() => deleteSub(cat._id, sub._id)}
//                                 >
//                                   Delete
//                                 </button>
//                               </div> */}
// <div className="dots-wrap">
//   <button
//     className="dots-btn small-dots"
//     onClick={(e) => {
//       e.stopPropagation();
//       setOpenMenuId(openMenuId === sub._id ? null : sub._id);
//     }}
//   >
//     ⋯
//   </button>

//   {openMenuId === sub._id && (
//     <div className="dots-menu">
//       <button
//         className="menu-item"
//         onClick={() => {
//           openSubModal(cat, sub);
//           setOpenMenuId(null);
//         }}
//       >
//         Edit
//       </button>

//       <button
//         className="menu-item"
//         onClick={() => {
//           deleteSub(cat._id, sub._id);
//           setOpenMenuId(null);
//         }}
//       >
//         Delete
//       </button>
//     </div>
//   )}
// </div>




//                             </div>
//                           ))}
//                         </div>

//                         {/* Sub Form */}
//                         <form
//                           className="sub-form"
//                           onSubmit={(e) => submitSub(e, cat._id)}
//                         >
//                           <input
//                             name="name"
//                             type="text"
//                             placeholder="Subcategory name"
//                             value={subForm.name}
//                             onChange={onSubInputChange}
//                           />

//                           <input
//                             name="image"
//                             type="file"
//                             accept="image/*"
//                             onChange={onSubInputChange}
//                           />

//                           <button type="submit">
//                             {editSubInfo.subId ? "Update Sub" : "Add Sub"}
//                           </button>
//                         </form>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ------------------ Mobile Cards ------------------ */}
     

//       {/* Pagination */}
//       <div className="pagination">
//         <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
//           Prev
//         </button>

//         {Array.from({ length: totalPages }).map((_, i) => (
//           <button
//             key={i}
//             className={currentPage === i + 1 ? "active-page" : ""}
//             onClick={() => setCurrentPage(i + 1)}
//           >
//             {i + 1}
//           </button>
//         ))}

//         <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
//           Next
//         </button>
//       </div>

//       {/* ------------------- Modal (simple centered) ------------------- */}
//       {isModalOpen && (
//         <div className="cm-modal-overlay" onMouseDown={closeModal}>
//           <div className="cm-modal" onMouseDown={(e) => e.stopPropagation()}>
//             <h3>{modalMode === "category" ? "Edit Category" : "Edit Subcategory"}</h3>

//             <form onSubmit={saveModal} className="cm-modal-form">
//               {modalMode === "category" ? (
//                 <>
//                   <label className="modal-label">Name</label>
//                   <input
//                     name="name"
//                     value={catForm.name}
//                     onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
//                   />

//                   <label className="modal-label">Image</label>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleModalImageChange}
//                   />

//                   {modalPreview && (
//                     <div className="modal-preview">
//                       <img src={modalPreview} alt="preview" />
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <label className="modal-label">Subcategory Name</label>
//                   <input
//                     name="name"
//                     value={subForm.name}
//                     onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
//                   />

//                   <label className="modal-label">Image</label>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleModalImageChange}
//                   />

//                   {modalPreview && (
//                     <div className="modal-preview">
//                       <img src={modalPreview} alt="preview" />
//                     </div>
//                   )}
//                 </>
//               )}

//               <div className="modal-actions">
//                 <button type="submit" className="btn-primary">
//                   Update
//                 </button>
//                 <button type="button" className="btn-cancel" onClick={closeModal}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CategoryManager;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CategoryManager.css";

const API_BASE = "https://grocerrybackend.onrender.com/api/categories";

const emptyCategoryForm = { name: "", image: null };
const emptySubForm = { name: "", image: null };

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState(emptyCategoryForm);
  const [editCatId, setEditCatId] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const [subForm, setSubForm] = useState(emptySubForm);
  const [editSubInfo, setEditSubInfo] = useState({ catId: null, subId: null });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [searchText, setSearchText] = useState("");

  // Modal Edit Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("category");
  const [modalTarget, setModalTarget] = useState({ catId: null, subId: null });
  const [modalPreview, setModalPreview] = useState(null);
  const fileInputRef = useRef(null);

  /* ------------------- Fetch Categories -------------------- */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_BASE);
      const cats = res.data.categories || res.data.data || [];

      setCategories(
        cats.map((c) => ({
          ...c,
          subcategories: Array.isArray(c.subcategories)
            ? c.subcategories
            : [],
        }))
      );
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ------------------- SEARCH FILTER FIX -------------------- */
  const filterCategories = (cats, q) => {
    if (!q || !q.trim()) return cats;

    const t = q.toLowerCase();

    return cats
      .map((c) => {
        const matchedSubs = c.subcategories.filter((s) =>
          s.name.toLowerCase().includes(t)
        );

        const categoryMatches = c.name.toLowerCase().includes(t);

        if (categoryMatches) return c;

        if (matchedSubs.length) {
          return { ...c, subcategories: matchedSubs };
        }

        return null;
      })
      .filter(Boolean);
  };

  /* ------------------- CATEGORY INPUT -------------------- */
  const onCatInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setCatForm((p) => ({ ...p, image: files[0] }));
    else setCatForm((p) => ({ ...p, [name]: value }));
  };

  /* ------------------- SUB INPUT -------------------- */
  const onSubInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setSubForm((p) => ({ ...p, image: files[0] }));
    else setSubForm((p) => ({ ...p, [name]: value }));
  };

  /* ------------------- SAVE CATEGORY -------------------- */
  const submitCategory = async (e) => {
    e.preventDefault();

    if (!catForm.name.trim()) return toast.warn("Enter category name");

    const fd = new FormData();
    fd.append("name", catForm.name);
    if (catForm.image) fd.append("image", catForm.image);

    try {
      if (editCatId) {
        await axios.put(`${API_BASE}/${editCatId}`, fd);
        toast.success("Category updated");
      } else {
        await axios.post(API_BASE, fd);
        toast.success("Category added");
      }

      setCatForm(emptyCategoryForm);
      setEditCatId(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
    }
  };

  /* ------------------- DELETE CATEGORY -------------------- */
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  /* ------------------- SAVE SUBCATEGORY -------------------- */
  const submitSub = async (e, catId) => {
    e.preventDefault();
    if (!subForm.name.trim()) return toast.warn("Enter subcategory name");

    const fd = new FormData();
    fd.append("name", subForm.name);
    if (subForm.image) fd.append("image", subForm.image);

    try {
      if (editSubInfo.subId) {
        await axios.put(
          `${API_BASE}/${editSubInfo.catId}/sub/${editSubInfo.subId}`,
          fd
        );
        toast.success("Subcategory updated");
      } else {
        await axios.post(`${API_BASE}/${catId}/sub`, fd);
        toast.success("Subcategory added");
      }

      setSubForm(emptySubForm);
      setEditSubInfo({ catId: null, subId: null });
      fetchCategories();
    } catch {
      toast.error("Failed to save subcategory");
    }
  };

  /* ------------------- DELETE SUBCATEGORY -------------------- */
  const deleteSub = async (catId, subId) => {
    if (!window.confirm("Delete this subcategory?")) return;

    try {
      await axios.delete(`${API_BASE}/${catId}/sub/${subId}`);
      toast.success("Subcategory deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete subcategory");
    }
  };

  /* ------------------- MODAL HANDLERS -------------------- */
  const openCategoryModal = (cat) => {
    setModalMode("category");
    setModalTarget({ catId: cat._id, subId: null });
    setModalPreview(cat.image);
    setCatForm({ name: cat.name, image: null });
    setIsModalOpen(true);
  };

  const openSubModal = (cat, sub) => {
    setModalMode("subcategory");
    setModalTarget({ catId: cat._id, subId: sub._id });
    setModalPreview(sub.image);
    setSubForm({ name: sub.name, image: null });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPreview(null);
    setModalTarget({ catId: null, subId: null });
    setCatForm(emptyCategoryForm);
    setSubForm(emptySubForm);
  };

  const handleModalImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalPreview(URL.createObjectURL(file));
      if (modalMode === "category")
        setCatForm((p) => ({ ...p, image: file }));
      else setSubForm((p) => ({ ...p, image: file }));
    }
  };

  const saveModal = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      if (modalMode === "category") {
        fd.append("name", catForm.name);
        if (catForm.image) fd.append("image", catForm.image);

        await axios.put(`${API_BASE}/${modalTarget.catId}`, fd);
        toast.success("Category updated");
      } else {
        fd.append("name", subForm.name);
        if (subForm.image) fd.append("image", subForm.image);

        await axios.put(
          `${API_BASE}/${modalTarget.catId}/sub/${modalTarget.subId}`,
          fd
        );
        toast.success("Subcategory updated");
      }

      closeModal();
      fetchCategories();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ------------------- PAGINATION -------------------- */
  const filtered = filterCategories(categories, searchText);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filtered.length, totalPages]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentCats = filtered.slice(firstIndex, lastIndex);

  /* ------------------- UI -------------------- */
  return (
    <div className="category-container">
      <ToastContainer />

      <div className="header">
        <h2> Category Manager</h2>
        {/* <p>Add categories & subcategories (mobile-friendly)</p> */}

        {/* <input
          className="search-input"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button
          className="add-cat-btn"
          onClick={() => setShowCatForm(!showCatForm)}
        >
          {showCatForm ? "Close" : "Add Category"}
        </button> */}
{/* 
        <div className="header-row">
  <input
    className="search-input"
    placeholder="Search..."
    value={searchText}
    onChange={(e) => {
      setSearchText(e.target.value);
      setCurrentPage(1);
    }}
  />

  <button
    className="add-cat-btn"
    onClick={() => setShowCatForm(!showCatForm)}
  >
    {showCatForm ? "Close" : "Add Category"}
  </button>
</div> */}
<div className="header-row-fixed">
  <input
    className="search-input-fixed"
    placeholder="Search..."
    value={searchText}
    onChange={(e) => {
      setSearchText(e.target.value);
      setCurrentPage(1);
    }}
  />

  <button
    className="add-cat-btn-fixed"
    onClick={() => setShowCatForm(!showCatForm)}
  >
    {showCatForm ? "Close" : "Add Category"}
  </button>
</div>

      </div>

      {/* CATEGORY FORM TOGGLE */}
      {showCatForm && (
        <div className="top-row slide-down">
          <form className="category-form" onSubmit={submitCategory}>
            <div className="form-row">
              <input
                name="name"
                type="text"
                placeholder="Enter category name"
                value={catForm.name}
                onChange={onCatInputChange}
              />

              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={onCatInputChange}
              />

              <button type="submit">
                {editCatId ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY TABLE */}
      <div className="category-list">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Subcategories</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentCats.map((cat, i) => (
              <React.Fragment key={cat._id}>
                <tr>
                  <td>{firstIndex + i + 1}</td>
                  <td>
                    {cat.image ? (
                      <img src={cat.image} className="table-img" alt="" />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td>{cat.name}</td>

                  <td>
                    {cat.subcategories.length}{" "}
                    <button
                      className="small-btn"
                      onClick={() =>
                        setExpandedCat(
                          expandedCat === cat._id ? null : cat._id
                        )
                      }
                    >
                      {expandedCat === cat._id ? "Hide" : "Manage"}
                    </button>
                  </td>

                  <td>
                    <div className="dots-wrap">
                      <button
                        className="dots-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === cat._id ? null : cat._id
                          );
                        }}
                      >
                        ⋯
                      </button>

                      {openMenuId === cat._id && (
                        <div className="dots-menu">
                          <button
                            className="menu-item"
                            onClick={() => {
                              openCategoryModal(cat);
                              setOpenMenuId(null);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="menu-item"
                            onClick={() => {
                              deleteCategory(cat._id);
                              setOpenMenuId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {/* SUBCATEGORY SECTION */}
                {expandedCat === cat._id && (
                  <tr>
                    <td colSpan="5">
                      <div className="sub-section">
                        <h4>{cat.name} - Subcategories</h4>

                        <div className="sub-list">
                          {cat.subcategories.map((sub) => (
                            <div className="sub-item" key={sub._id}>
                              <div className="sub-left">
                                {sub.image ? (
                                  <img
                                    src={sub.image}
                                    className="sub-thumb"
                                    alt=""
                                  />
                                ) : (
                                  <div className="sub-thumb no-img">No</div>
                                )}

                                <div className="sub-name">{sub.name}</div>
                              </div>

                              <div className="dots-wrap">
                                <button
                                  className="dots-btn small-dots"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === sub._id
                                        ? null
                                        : sub._id
                                    );
                                  }}
                                >
                                  ⋯
                                </button>

                                {openMenuId === sub._id && (
                                  <div className="dots-menu">
                                    <button
                                      className="menu-item"
                                      onClick={() => {
                                        openSubModal(cat, sub);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      className="menu-item"
                                      onClick={() => {
                                        deleteSub(cat._id, sub._id);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SUB FORM */}
                        <form
                          className="sub-form"
                          onSubmit={(e) => submitSub(e, cat._id)}
                        >
                          <input
                            name="name"
                            type="text"
                            placeholder="Subcategory name"
                            value={subForm.name}
                            onChange={onSubInputChange}
                          />

                          <input
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={onSubInputChange}
                          />

                          <button type="submit">
                            {editSubInfo.subId ? "Update Sub" : "Add Sub"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* EDIT POPUP */}
      {isModalOpen && (
        <div className="cm-modal-overlay" onMouseDown={closeModal}>
          <div className="cm-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>
              {modalMode === "category"
                ? "Edit Category"
                : "Edit Subcategory"}
            </h3>

            <form onSubmit={saveModal} className="cm-modal-form">
              {modalMode === "category" ? (
                <>
                  <label className="modal-label">Name</label>
                  <input
                    name="name"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />

                  <label className="modal-label">Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModalImageChange}
                  />

                  {modalPreview && (
                    <div className="modal-preview">
                      <img src={modalPreview} alt="preview" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="modal-label">Subcategory Name</label>
                  <input
                    name="name"
                    value={subForm.name}
                    onChange={(e) =>
                      setSubForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />

                  <label className="modal-label">Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModalImageChange}
                  />

                  {modalPreview && (
                    <div className="modal-preview">
                      <img src={modalPreview} alt="preview" />
                    </div>
                  )}
                </>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Update
                </button>

                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
