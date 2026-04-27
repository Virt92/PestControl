import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocumentStatus, DocumentType } from '@/types'

const STORAGE_KEY = 'pc_documents'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadFromStorage(): Document[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) as Document[] : []
}

function saveToStorage(items: Document[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>(loadFromStorage())

  const drafts = computed(() => documents.value.filter(d => d.status === 'draft'))
  const published = computed(() => documents.value.filter(d => d.status === 'published'))

  function getById(id: string): Document | undefined {
    return documents.value.find(d => d.id === id)
  }

  function getByObjectId(objectId: string): Document[] {
    return documents.value.filter(d => d.objectId === objectId)
  }

  function add(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const doc: Document = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    documents.value.push(doc)
    saveToStorage(documents.value)
    return doc
  }

  function update(id: string, data: Partial<Document>) {
    const idx = documents.value.findIndex(d => d.id === id)
    if (idx === -1) return
    documents.value[idx] = { ...documents.value[idx], ...data, updatedAt: new Date().toISOString() }
    saveToStorage(documents.value)
  }

  function publish(id: string) {
    update(id, { status: 'published', publishedAt: new Date().toISOString() })
  }

  function remove(id: string) {
    documents.value = documents.value.filter(d => d.id !== id)
    saveToStorage(documents.value)
  }

  function search(query: string, objectId?: string, type?: DocumentType, status?: DocumentStatus): Document[] {
    const q = query.toLowerCase()
    return documents.value.filter(d => {
      const matchesQuery = !q || d.title.toLowerCase().includes(q)
      const matchesObject = !objectId || d.objectId === objectId
      const matchesType = !type || d.type === type
      const matchesStatus = !status || d.status === status
      return matchesQuery && matchesObject && matchesType && matchesStatus
    })
  }

  return { documents, drafts, published, getById, getByObjectId, add, update, publish, remove, search }
})
