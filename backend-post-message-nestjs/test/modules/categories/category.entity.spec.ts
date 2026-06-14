import { CategoryEntity } from '../../../src/app/modules/categories/domain/entities/category.entity';
import { CATEGORY_MESSAGES, CATEGORY_VALIDATION } from '../../../src/app/modules/categories/constants/category.constants';

describe('CategoryEntity', () => {
  const validCategoryData = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech-related posts',
    color: '#3B82F6',
    postsCount: 0,
    isActive: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  };

  describe('constructor & validation', () => {
    it('should create a valid category entity', () => {
      const entity = new CategoryEntity(validCategoryData);
      expect(entity.name).toBe('Technology');
      expect(entity.slug).toBe('technology');
      expect(entity.isActive).toBe(true);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, name: '' });
      }).toThrow();
    });

    it('should throw error for name shorter than min length', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, name: 'T' });
      }).toThrow();
    });

    it('should throw error for name longer than max length', () => {
      const longName = 'a'.repeat(CATEGORY_VALIDATION.NAME_MAX_LENGTH + 1);
      expect(() => {
        new CategoryEntity({ ...validCategoryData, name: longName });
      }).toThrow();
    });

    it('should throw error for invalid slug format', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, slug: 'Invalid Slug!' });
      }).toThrow();
    });

    it('should throw error for slug shorter than min length', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, slug: 'a' });
      }).toThrow();
    });

    it('should throw error for invalid color format', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, color: 'not-a-color' });
      }).toThrow();
    });

    it('should accept valid hex color formats', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, color: '#FFF' });
      }).not.toThrow();

      expect(() => {
        new CategoryEntity({ ...validCategoryData, color: '#FFFFFF' });
      }).not.toThrow();
    });

    it('should throw error for description longer than max length', () => {
      const longDescription = 'a'.repeat(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH + 1);
      expect(() => {
        new CategoryEntity({ ...validCategoryData, description: longDescription });
      }).toThrow();
    });
  });

  describe('immutability', () => {
    it('should not allow direct property modification', () => {
      const entity = new CategoryEntity(validCategoryData);
      expect(() => {
        entity.name = 'New Name';
      }).toThrow();
    });

    it('should have readonly properties', () => {
      const entity = new CategoryEntity(validCategoryData);
      const propertyDescriptor = Object.getOwnPropertyDescriptor(entity, 'name');
      expect(propertyDescriptor?.writable).toBeFalsy();
    });
  });

  describe('business logic methods', () => {
    describe('update', () => {
      it('should update category with valid data', () => {
        const entity = new CategoryEntity(validCategoryData);
        const updated = entity.update({ name: 'Updated Tech', description: 'Updated description' });

        expect(updated.name).toBe('Updated Tech');
        expect(updated.description).toBe('Updated description');
      });

      it('should validate updated name length', () => {
        const entity = new CategoryEntity(validCategoryData);
        const longName = 'a'.repeat(CATEGORY_VALIDATION.NAME_MAX_LENGTH + 1);

        expect(() => {
          entity.update({ name: longName });
        }).toThrow();
      });

      it('should not modify original entity on update', () => {
        const entity = new CategoryEntity(validCategoryData);
        const originalName = entity.name;
        entity.update({ name: 'New Name' });

        expect(entity.name).toBe(originalName);
      });
    });

    describe('incrementPostsCount', () => {
      it('should increment posts count', () => {
        const entity = new CategoryEntity(validCategoryData);
        const updated = entity.incrementPostsCount();

        expect(updated.postsCount).toBe(validCategoryData.postsCount + 1);
      });

      it('should not modify original entity', () => {
        const entity = new CategoryEntity(validCategoryData);
        const originalCount = entity.postsCount;
        entity.incrementPostsCount();

        expect(entity.postsCount).toBe(originalCount);
      });
    });

    describe('decrementPostsCount', () => {
      it('should decrement posts count', () => {
        const dataWithPosts = { ...validCategoryData, postsCount: 5 };
        const entity = new CategoryEntity(dataWithPosts);
        const updated = entity.decrementPostsCount();

        expect(updated.postsCount).toBe(4);
      });

      it('should not go below zero', () => {
        const entity = new CategoryEntity(validCategoryData);
        const updated = entity.decrementPostsCount();

        expect(updated.postsCount).toBe(0);
      });

      it('should not modify original entity', () => {
        const dataWithPosts = { ...validCategoryData, postsCount: 5 };
        const entity = new CategoryEntity(dataWithPosts);
        const originalCount = entity.postsCount;
        entity.decrementPostsCount();

        expect(entity.postsCount).toBe(originalCount);
      });
    });

    describe('canDelete', () => {
      it('should allow deletion when no posts', () => {
        const entity = new CategoryEntity(validCategoryData);
        expect(entity.canDelete()).toBe(true);
      });

      it('should prevent deletion when posts exist', () => {
        const dataWithPosts = { ...validCategoryData, postsCount: 5 };
        const entity = new CategoryEntity(dataWithPosts);
        expect(entity.canDelete()).toBe(false);
      });
    });

    describe('activate & deactivate', () => {
      it('should activate inactive category', () => {
        const inactiveData = { ...validCategoryData, isActive: false };
        const entity = new CategoryEntity(inactiveData);
        const activated = entity.activate();

        expect(activated.isActive).toBe(true);
      });

      it('should deactivate active category', () => {
        const entity = new CategoryEntity(validCategoryData);
        const deactivated = entity.deactivate();

        expect(deactivated.isActive).toBe(false);
      });

      it('should not modify original entity on activate', () => {
        const inactiveData = { ...validCategoryData, isActive: false };
        const entity = new CategoryEntity(inactiveData);
        entity.activate();

        expect(entity.isActive).toBe(false);
      });

      it('should not modify original entity on deactivate', () => {
        const entity = new CategoryEntity(validCategoryData);
        entity.deactivate();

        expect(entity.isActive).toBe(true);
      });
    });

    describe('generateSlug', () => {
      it('should generate slug from name', () => {
        const entity = new CategoryEntity(validCategoryData);
        const slug = entity.generateSlug('New Category Name');

        expect(slug).toBe('new-category-name');
      });

      it('should handle special characters', () => {
        const entity = new CategoryEntity(validCategoryData);
        const slug = entity.generateSlug('C++ & C#');

        expect(slug).toMatch(/^[a-z0-9-]+$/);
      });

      it('should handle spaces correctly', () => {
        const entity = new CategoryEntity(validCategoryData);
        const slug = entity.generateSlug('Multiple   Spaces');

        expect(slug).toBe('multiple-spaces');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null description', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, description: null });
      }).not.toThrow();
    });

    it('should handle undefined description', () => {
      expect(() => {
        new CategoryEntity({ ...validCategoryData, description: undefined });
      }).not.toThrow();
    });

    it('should handle zero posts count', () => {
      const entity = new CategoryEntity({ ...validCategoryData, postsCount: 0 });
      expect(entity.postsCount).toBe(0);
    });

    it('should maintain dates on creation', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      const entity = new CategoryEntity({ ...validCategoryData, createdAt: testDate });

      expect(entity.createdAt).toEqual(testDate);
    });

    it('should handle minimum valid name length', () => {
      const minName = 'ab';
      expect(() => {
        new CategoryEntity({ ...validCategoryData, name: minName });
      }).not.toThrow();
    });

    it('should handle maximum valid name length', () => {
      const maxName = 'a'.repeat(CATEGORY_VALIDATION.NAME_MAX_LENGTH);
      expect(() => {
        new CategoryEntity({ ...validCategoryData, name: maxName });
      }).not.toThrow();
    });
  });
});
