// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import "./CategoryList.css";

// // const API = "https://grocerrybackend.onrender.com/api/categories";

// // export default function CategoryList() {
// //   const [categories, setCategories] = useState([]);
// //   const [search, setSearch] = useState("");

// //   // Fetch categories
// //   const fetchCategories = async () => {
// //     try {
// //       const res = await axios.get(API);
// //       setCategories(res.data.categories || []);
// //     } catch (err) {
// //       console.log("Error fetching categories", err);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchCategories();
// //   }, []);

// //   // Filter logic
// //   const filtered = categories.filter((cat) =>
// //     cat.name.toLowerCase().includes(search.toLowerCase())
// //   );

// //   return (
// //     <div className="catlist-container">

// //       {/* 🔍 Search Bar */}
// //       <div className="catlist-search-wrapper">
// //         <div className="catlist-search-box">
// //           <span className="catlist-search-icon">🔍</span>
// //           <input
// //             type="text"
// //             placeholder="Search category..."
// //             className="catlist-search-input"
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //           />
// //         </div>
// //       </div>

// //       {/* Category List */}
// //       <div className="catlist-grid">
// //         {filtered.length === 0 ? (
// //           <p className="no-data">No categories found</p>
// //         ) : (
// //           filtered.map((cat) => (
// //             <div key={cat._id} className="cat-item">
// //               <img
// //                 src={cat.image || "https://via.placeholder.com/100"}
// //                 alt=""
// //                 className="cat-thumb"
// //               />
// //               <p className="cat-name">{cat.name}</p>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./CategoryList.css";

// const API = "https://grocerrybackend.onrender.com/api/categories";

// export default function CategoryList() {
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(API);
//       setCategories(res.data.categories || []);
//     } catch (err) {
//       console.log("Error fetching categories", err);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // Filter logic
//   const filtered = categories.filter((cat) =>
//     cat.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="catlist-container">

//       {/* 🔍 Search Bar */}
//       <div className="catlist-search-wrapper">
//         <div className="catlist-search-box">
//           <span className="catlist-search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search category..."
//             className="catlist-search-input"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* ---- DESKTOP TABLE ---- */}
//       <div className="catlist-table-wrapper">
//         <table className="catlist-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Image</th>
//               <th>Name</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.length === 0 ? (
//               <tr>
//                 <td colSpan="3" className="no-data">No categories found</td>
//               </tr>
//             ) : (
//               filtered.map((cat, index) => (
//                 <tr key={cat._id}>
//                   <td>{index + 1}</td>
//                   <td>
//                     <img
//                       src={cat.image || "https://via.placeholder.com/100"}
//                       className="catlist-img"
//                       alt=""
//                     />
//                   </td>
//                   <td>{cat.name}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ---- MOBILE LIST ---- */}
//       <div className="catlist-mobile-list">
//         {filtered.map((cat, index) => (
//           <div key={cat._id} className="mobile-row">
//             <span className="mobile-index">{index + 1}</span>

//             <img
//               src={cat.image || "https://via.placeholder.com/100"}
//               className="mobile-img"
//               alt=""
//             />

//             <span className="mobile-title">{cat.name}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CategoryList.css";

const API = "https://grocerrybackend.onrender.com/api/categories";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="catlist-container">
      
      {/* Search */}
      <div className="catlist-search-wrapper">
        <div className="catlist-search-box">
          <span className="catlist-search-icon">🔍</span>
         
          <input
            type="text"
            placeholder="Search category..."
            className="catlist-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ALWAYS SHOW TABLE (desktop + mobile) */}
      <div className="catlist-table-wrapper">
        <table className="catlist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">No categories found</td>
              </tr>
            ) : (
              filtered.map((cat, index) => (
                <tr key={cat._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={cat.image || "https://via.placeholder.com/100"}
                      className="catlist-img"
                      alt=""
                    />
                  </td>
                  <td>{cat.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
