import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import SingleImageUpload from '../../components/admin/SingleImageUpload';

const emptyForm = {
  title: '', slug: '', category: 'literature', excerpt: '', content: '',
  author: { name: '', bio: '', image: '', isGuest: false },
  coverImage: '', images: [], tags: '', readTime: 5, isPublished: false, isFeatured: false
};

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.adminGetArticles()
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (article) => {
    setEditing(article._id);
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      category: article.category || 'literature',
      excerpt: article.excerpt || '',
      content: article.content || '',
      author: article.author || { name: '', bio: '', image: '', isGuest: false },
      coverImage: article.coverImage || '',
      images: article.images || [],
      tags: (article.tags || []).join(', '),
      readTime: article.readTime || 5,
      isPublished: article.isPublished || false,
      isFeatured: article.isFeatured || false
    });
    setShowForm(true);
  };

  const handleImageFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4 - form.images.length);
    const oversized = imgs.filter(f => f.size > 3 * 1024 * 1024);
    if (oversized.length > 0) { alert(`${oversized.length} image(s) exceed 3 MB and were skipped`); }
    const valid = imgs.filter(f => f.size <= 3 * 1024 * 1024);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setForm(prev => {
        const newImages = [...prev.images, e.target.result];
        return { ...prev, images: newImages, coverImage: newImages[0] };
      });
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    if (saving) return;
    e.preventDefault();
    setSaving(true);
    const updatedCoverImage = form.images.length > 0 ? form.images[0] : form.coverImage;
    const payload = {
      ...form,
      coverImage: updatedCoverImage,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean)
    };
    try {
      if (editing) {
        await api.adminUpdateArticle(editing, payload);
      } else {
        await api.adminCreateArticle(payload);
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
    await api.adminDeleteArticle(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Articles</h1>
          <p className="text-slate-600 mt-1 text-sm">Manage blog articles and stories</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Article
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
              <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Article' : 'Add Article'}</h2>
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
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900">
                    <option value="heritage">Heritage</option>
                    <option value="culture">Culture</option>
                    <option value="history">History</option>
                    <option value="literature">Literature</option>
                    <option value="poetry">Poetry</option>
                    <option value="travel-stories">Travel Stories</option>
                    <option value="documentaries">Documentaries</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Read Time (min)</label>
                  <input type="number" min="1" value={form.readTime} onChange={e => setForm({...form, readTime: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <div className="flex items-end gap-4 pb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-4 h-4" />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4" />
                    Featured
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Excerpt *</label>
                <textarea required rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Content *</label>
                <textarea required rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Images (up to 4)</label>
                <div
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-3 ${
                    form.images.length >= 4 ? 'opacity-50 pointer-events-none border-slate-300 bg-slate-100/20' :
                    dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <span className="material-icons text-4xl text-slate-400 mb-2 block">cloud_upload</span>
                  <p className="text-slate-600 font-semibold mb-1 text-sm">
                    {form.images.length >= 4 ? 'Maximum 4 images reached' : 'Drag & drop images here'}
                  </p>
                  <p className="text-slate-400 text-xs mb-3">PNG, JPG, WEBP (max 3 MB each)</p>
                  <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-sm">
                    Browse Files
                    <input type="file" multiple accept="image/*" onChange={e => { handleImageFiles(e.target.files); e.target.value = ''; }} className="hidden" disabled={form.images.length >= 4} />
                  </label>
                  <p className="text-slate-500 text-xs mt-2">{form.images.length} / 4 images added</p>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setForm(f => { const newImages = f.images.filter((_, idx) => idx !== i); return { ...f, images: newImages, coverImage: newImages[0] || '' }; })}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                            <span className="material-icons text-[14px]">delete</span>
                          </button>
                        </div>
                        <div className="absolute top-1 left-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-xs font-bold">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Author Name *</label>
                  <input type="text" required value={form.author.name} onChange={e => setForm({...form, author: {...form.author, name: e.target.value}})}
                    className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
                </div>
                <SingleImageUpload
                  label="Author Image"
                  value={form.author.image}
                  onChange={(val) => setForm({ ...form, author: { ...form.author, image: val } })}
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Author Bio</label>
                <textarea rows={2} value={form.author.bio} onChange={e => setForm({...form, author: {...form.author, bio: e.target.value}})}
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                  placeholder="Kashmir, Culture, History"
                  className="w-full bg-white border border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-900" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white px-6 py-3 rounded-xl font-bold shadow-sm disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Article' : 'Create Article'}
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
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Article</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Category</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Author</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Stats</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Status</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article._id} className="border-b border-slate-200 hover:bg-slate-100/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={article.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{article.title}</p>
                        <p className="text-[13px] text-slate-600">{article.readTime} min read</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{article.category.replace('-', ' ')}</td>
                  <td className="px-4 py-4 text-slate-600">{article.author.name}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">
                    <div>{article.views} views</div>
                    <div>{article.likes} likes</div>
                  </td>
                  <td className="px-4 py-4">
                    {article.isPublished && <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded text-xs font-bold mr-2">PUBLISHED</span>}
                    {article.isFeatured && <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-xs font-bold">FEATURED</span>}
                    {!article.isPublished && <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded text-xs font-bold">DRAFT</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => openEdit(article)} className="text-[#C2410C] hover:text-[#9A3412] mr-3">
                      <span className="material-icons text-[18px]">edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(article)} className="text-red-600 hover:text-red-600">
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
        itemName={deleteTarget?.title || 'this article'}
      />
    </div>
  );
}
