import { useEffect, useState } from 'react';
import PostEditor from './PostEditor';
import type { Post } from './types';

interface Props {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Seguro que quieres eliminar este articulo?')) return;
    try {
      await fetch('/api/posts/' + id, { method: 'DELETE' });
      setPosts(posts.filter((p) => p.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setView('edit');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    onLogout();
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      const [y, m, day] = d.split('-');
      const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      return day + ' ' + months[parseInt(m)-1] + ' ' + y;
    } catch { return d; }
  };

  if (view === 'new' || view === 'edit') {
    return (
      <PostEditor
        post={editingPost}
        onBack={() => { setView('list'); fetchPosts(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-bold text-gray-900">Panel Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setEditingPost(null); setView('new'); }}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              + Nuevo Articulo
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Articulos ({posts.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando articulos...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <p className="text-gray-400 text-lg mb-4">No hay articulos todavia</p>
            <button
              onClick={() => { setEditingPost(null); setView('new'); }}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
            >
              Crear mi primer articulo
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Articulo</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Fecha</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Destacado</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img src={post.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 hidden md:table-cell">{formatDate(post.date)}</td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      {post.featured ? (
                        <span className="text-yellow-500 text-lg">&#9733;</span>
                      ) : (
                        <span className="text-gray-300 text-lg">&#9734;</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={'/blog/' + post.slug} target="_blank" className="p-2 text-gray-400 hover:text-primary transition-colors" title="Ver">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <button onClick={() => handleEdit(post)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Editar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
