import { useState } from 'react';
import type { Post } from './types';

interface Props {
  post: Post | null;
  onBack: () => void;
}

export default function PostEditor({ post, onBack }: Props) {
  const [form, setForm] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    date: post?.date || new Date().toISOString().split('T')[0],
    image: post?.image || '',
    category: post?.category || 'Noticias',
    author: post?.author || 'Ves Sport',
    readTime: post?.readTime || '5 min',
    featured: post?.featured || false,
    content: post?.content || '',
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const url = post ? '/api/posts/' + post.id : '/api/posts';
      const method = post ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage(post ? 'Articulo actualizado correctamente' : 'Articulo creado correctamente');
        setTimeout(() => onBack(), 1000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Error al guardar');
      }
    } catch {
      setMessage('Error de conexion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <span className="font-bold text-gray-900">{post ? 'Editar Articulo' : 'Nuevo Articulo'}</span>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-medium ${message.includes('Error') || message.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Titulo</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Extracto</label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                  <option value="Noticias">Noticias</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Guias">Guias</option>
                  <option value="Patrocinios">Patrocinios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Autor</label>
                <input type="text" name="author" value={form.author} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tiempo de lectura</label>
                <input type="text" name="readTime" value={form.readTime} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="5 min" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Imagen URL</label>
              <input type="text" name="image" value={form.image} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="/images/blog/ejemplo.avif o https://..." required />
              {form.image && (
                <img src={form.image} alt="Preview" className="mt-3 rounded-xl h-40 object-cover w-full" />
              )}
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} id="featured" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700">Articulo destacado</label>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-gray-700">Contenido (Markdown)</label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                {preview ? 'Editar' : 'Vista previa'}
              </button>
            </div>

            {preview ? (
              <div className="prose prose-lg max-w-none border border-gray-200 rounded-xl p-6 min-h-[300px] bg-gray-50">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{form.content}</pre>
              </div>
            ) : (
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={20}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm"
                placeholder="Escribe el contenido en Markdown..."
                required
              />
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : post ? 'Actualizar' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
