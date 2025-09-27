import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/categories';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';

const CategoryForm = ({ 
  category, 
  onSave, 
  onCancel 
}: { 
  category?: Category; 
  onSave: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3B82F6',
    icon: category?.icon || '',
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="color">Цвет</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-16 h-10"
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="#3B82F6"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="icon">Иконка</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="tree, water, eagle, bird, city"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Активна</Label>
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit">
          {category ? 'Обновить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete, 
  onDeactivate 
}: { 
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <h3 className="font-semibold">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
            {category.icon && (
              <span className="text-xs text-gray-500">Иконка: {category.icon}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Активна' : 'Неактивна'}
          </span>
          
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(category)}
            >
              Изменить
            </Button>
            {category.isActive ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeactivate(category.id)}
              >
                Деактивировать
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(category.id)}
              >
                Удалить
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    deactivateCategory 
  } = useCategories();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Проверяем права доступа
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (user && user.role !== 'admin') {
    return null;
  }

  const handleCreate = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      await createCategory(data as CreateCategoryDto);
      setShowForm(false);
    } catch (error) {
      console.error('Ошибка создания категории:', error);
    }
  };

  const handleUpdate = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, data as UpdateCategoryDto);
      setEditingCategory(null);
    } catch (error) {
      console.error('Ошибка обновления категории:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Ошибка удаления категории:', error);
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Вы уверены, что хотите деактивировать эту категорию?')) {
      try {
        await deactivateCategory(id);
      } catch (error) {
        console.error('Ошибка деактивации категории:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление категориями</h1>
          <Button onClick={() => setShowForm(true)}>
            Создать категорию
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditingCategory}
              onDelete={handleDelete}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Категории не найдены</p>
          </div>
        )}

        {/* Диалог создания категории */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Создать категорию</h2>
            <CategoryForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </Dialog>

        {/* Диалог редактирования категории */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Редактировать категорию</h2>
            {editingCategory && (
              <CategoryForm
                category={editingCategory}
                onSave={handleUpdate}
                onCancel={() => setEditingCategory(null)}
              />
            )}
          </div>
        </Dialog>
      </div>
    </Layout>
  );
}
