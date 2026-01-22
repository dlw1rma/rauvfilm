'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  description: string | null;
  isActive: boolean;
  bookingCount: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?includeInactive=true');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('상품을 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90"
        >
          새 상품
        </button>
      </div>

      {/* 상품 폼 */}
      {showForm && (
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? '상품 수정' : '새 상품'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">상품명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="1인 2캠"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">가격 (원)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="500000"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '생성'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-muted"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 상품 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          상품이 없습니다.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-background rounded-xl border p-6 ${
                product.isActive ? 'border-border' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    {!product.isActive && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500">비활성</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-accent">{product.priceFormatted}</p>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                예약 {product.bookingCount}건
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80"
                >
                  수정
                </button>
                <button
                  onClick={() => handleToggleActive(product.id, product.isActive)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80"
                >
                  {product.isActive ? '비활성화' : '활성화'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
