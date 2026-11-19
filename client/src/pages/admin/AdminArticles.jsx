import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
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
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Articles</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage blog articles and stories</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Article
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => { if (!saving) setShowForm(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">{editing ? 'Edit Article' : 'Add Article'}</h2>
              <button type="button" aria-label="Close modal" onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white">
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75dvh] sm:max-h-[70vh] overflow-y-auto pr-1 sm:pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Slug *</label>
                  <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100">
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
                  <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Read Time (min)</label>
                  <input type="number" min="1" value={form.readTime} onChange={e => setForm({...form, readTime: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
                </div>
                <div className="flex flex-wrap items-end gap-3 sm:gap-4 pb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-4 h-4" />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4" />
                    Featured
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Excerpt *</label>
                <textarea required rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Content *</label>
                <textarea required rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Images (up to 4)</label>
                <div
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors mb-3 ${
                    form.images.length >= 4 ? 'opacity-50 pointer-events-none border-slate-700 bg-slate-800/20' :
                    dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-700 bg-slate-950/60 hover:border-slate-400'
                  }`}
                >
                  <span className="material-icons text-4xl text-slate-300 mb-2 block">cloud_upload</span>
                  <p className="text-slate-300 font-semibold mb-1 text-sm">
                    {form.images.length >= 4 ? 'Maximum 4 images reached' : 'Drag & drop images here'}
                  </p>
                  <p className="text-slate-300 text-xs mb-3">PNG, JPG, WEBP (max 3 MB each)</p>
                  <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-sm">
                    Browse Files
                    <input type="file" multiple accept="image/*" onChange={e => { handleImageFiles(e.target.files); e.target.value = ''; }} className="hidden" disabled={form.images.length >= 4} />
                  </label>
                  <p className="text-slate-300 text-xs mt-2">{form.images.length} / 4 images added</p>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-video">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                  <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Author Name *</label>
                  <input type="text" required value={form.author.name} onChange={e => setForm({...form, author: {...form.author, name: e.target.value}})}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
                </div>
                <SingleImageUpload
                  label="Author Image"
                  value={form.author.image}
                  onChange={(val) => setForm({ ...form, author: { ...form.author, image: val } })}
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Author Bio</label>
                <textarea rows={2} value={form.author.bio} onChange={e => setForm({...form, author: {...form.author, bio: e.target.value}})}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                  placeholder="Kashmir, Culture, History"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20 outline-none rounded-lg px-4 py-2.5 text-[15px] text-slate-100" />
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
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : articles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No articles found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {articles.map(article => (
              <AdminCard
                key={article._id}
                image={article.coverImage}
                title={article.title}
                subtitle={article.author?.name ? ('By ' + article.author.name) : null}
                topLeftBadges={[
                  {
                    label: article.isPublished ? '● PUBLISHED' : '● DRAFT',
                    className: article.isPublished
                      ? 'bg-emerald-950/85 text-emerald-200 border border-emerald-400/40'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-600',
                  },
                  ...(article.isFeatured ? [{ label: '★ FEATURED', className: 'bg-orange-600/90 text-white border border-orange-300/40' }] : []),
                ]}
                topRightBadge={article.readTime ? (article.readTime + ' min read') : null}
                bannerBottomLeft={(article.views || 0) + ' views · ' + (article.likes || 0) + ' likes'}
                bannerBottomRight={article.category ? article.category.replace(/-/g, ' ') : null}
                tags={article.tags || []}
                tagsLabel="Tags"
                onEdit={() => openEdit(article)}
                onDelete={() => setDeleteTarget(article)}
              />
            ))}
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
