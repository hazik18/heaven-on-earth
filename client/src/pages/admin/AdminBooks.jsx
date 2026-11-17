import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import SingleImageUpload from '../../components/admin/SingleImageUpload';

const emptyForm = {
  title: '', slug: '', author: '', category: 'poetry', language: 'english', description: '',
  excerpt: '', coverImage: '', publishedYear: '', publisher: '', isbn: '', pages: '',
  price: { amount: '' }, purchaseLinks: { amazon: '', flipkart: '', other: '' },
  availability: 'available', tags: '', isFeatured: false, isClassic: false
};

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.adminGetBooks()
      .then(setBooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (book) => {
    setEditing(book._id);
    setForm({
      title: book.title || '',
      slug: book.slug || '',
      author: book.author || '',
      category: book.category || 'poetry',
      language: book.language || 'english',
      description: book.description || '',
      excerpt: book.excerpt || '',
      coverImage: book.coverImage || '',
      publishedYear: book.publishedYear || '',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      pages: book.pages || '',
      price: { amount: book.price?.amount || '' },
      purchaseLinks: book.purchaseLinks || { amazon: '', flipkart: '', other: '' },
      availability: book.availability || 'available',
      tags: (book.tags || []).join(', '),
      isFeatured: book.isFeatured || false,
      isClassic: book.isClassic || false
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    if (saving) return;
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      price: { amount: form.price.amount ? Number(form.price.amount) : undefined },
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      pages: form.pages ? Number(form.pages) : undefined
    };
    try {
      if (editing) {
        await api.adminUpdateBook(editing, payload);
      } else {
        await api.adminCreateBook(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    await api.adminDeleteBook(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Books</h1>
          <p className="text-slate-600 mt-1 text-sm">Manage book listings</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Book
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => { if (!saving) setShowForm(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-6xl my-8 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-slate-900 font-bold">{editing ? 'Edit Book' : 'Add Book'}</h2>
              <button type="button" aria-label="Close modal" onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Slug *</label>
                  <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Author *</label>
                  <input type="text" required value={form.author} onChange={e => setForm({...form, author: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900">
                    <option value="poetry">Poetry</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="history">History</option>
                    <option value="culture">Culture</option>
                    <option value="travel">Travel</option>
                    <option value="biography">Biography</option>
                    <option value="anthology">Anthology</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Language *</label>
                  <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900">
                    <option value="english">English</option>
                    <option value="kashmiri">Kashmiri</option>
                    <option value="urdu">Urdu</option>
                    <option value="hindi">Hindi</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Excerpt</label>
                <textarea rows={3} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <SingleImageUpload
                label="Cover Image"
                value={form.coverImage}
                onChange={(val) => setForm({ ...form, coverImage: val })}
                required
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Published Year</label>
                  <input type="number" value={form.publishedYear} onChange={e => setForm({...form, publishedYear: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Pages</label>
                  <input type="number" value={form.pages} onChange={e => setForm({...form, pages: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Availability</label>
                  <select value={form.availability} onChange={e => setForm({...form, availability: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900">
                    <option value="available">Available</option>
                    <option value="out-of-print">Out of Print</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Publisher</label>
                  <input type="text" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">ISBN</label>
                  <input type="text" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Amazon Link</label>
                  <input type="url" value={form.purchaseLinks.amazon} onChange={e => setForm({...form, purchaseLinks: {...form.purchaseLinks, amazon: e.target.value}})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Flipkart Link</label>
                  <input type="url" value={form.purchaseLinks.flipkart} onChange={e => setForm({...form, purchaseLinks: {...form.purchaseLinks, flipkart: e.target.value}})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Other Link</label>
                  <input type="url" value={form.purchaseLinks.other} onChange={e => setForm({...form, purchaseLinks: {...form.purchaseLinks, other: e.target.value}})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                  placeholder="Kashmir, Poetry, Classic"
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={form.isClassic} onChange={e => setForm({...form, isClassic: e.target.checked})} className="w-4 h-4" />
                  Classic
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white px-6 py-3 rounded-xl font-bold shadow-sm disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Book' : 'Create Book'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Book</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Author</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Category</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Language</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Status</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book._id} className="border-b border-slate-200 hover:bg-slate-100/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={book.coverImage} alt="" className="w-10 h-14 rounded object-cover" />
                      <p className="font-bold text-slate-900 line-clamp-2">{book.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{book.author}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{book.category}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{book.language}</td>
                  <td className="px-4 py-4">
                    {book.isFeatured && <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-xs font-bold mr-2">FEATURED</span>}
                    {book.isClassic && <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-1 rounded text-xs font-bold">CLASSIC</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => openEdit(book)} className="text-[#C2410C] hover:text-[#9A3412] mr-3">
                      <span className="material-icons text-[18px]">edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(book)} className="text-red-600 hover:text-red-600">
                      <span className="material-icons text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title || 'this book'}
      />
    </div>
  );
}
